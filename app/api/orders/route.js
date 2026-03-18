import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import MenuItem from '@/lib/models/MenuItem';
import Restaurant from '@/lib/models/Restaurant';
import { authenticate } from '@/lib/auth';
import { authorize, countryFilter } from '@/lib/rbac';
import { successResponse, errorResponse } from '@/lib/response';

/** GET /api/orders — list orders (admin/manager see all in their country, members see own) */
export async function GET(request) {
    try {
        const user = await authenticate(request);
        authorize(user, 'create_order');

        await connectDB();

        // Admins & Managers see ALL orders in their country (so they can checkout/cancel)
        // Members only see their own orders
        const query = { ...countryFilter(user) };
        if (user.role === 'member') {
            query.user = user._id;
        }

        const orders = await Order.find(query)
            .populate('restaurant', 'name')
            .populate('user', 'name email role')
            .sort({ createdAt: -1 });

        return successResponse({ count: orders.length, data: { orders } });
    } catch (err) {
        return errorResponse(err);
    }
}

/** POST /api/orders — create a new order */
export async function POST(request) {
    try {
        const user = await authenticate(request);
        authorize(user, 'create_order');

        const { restaurantId, items } = await request.json();

        if (!restaurantId) throw { status: 400, message: 'Restaurant ID is required.' };
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw { status: 400, message: 'Order must contain at least one item.' };
        }

        await connectDB();

        const filter = countryFilter(user);

        // Verify restaurant
        const restaurant = await Restaurant.findOne({
            _id: restaurantId,
            ...filter,
            isActive: true,
        });
        if (!restaurant) {
            throw { status: 404, message: 'Restaurant not found or not accessible in your country.' };
        }

        // Validate menu items
        const menuItemIds = items.map((i) => i.menuItemId);
        const menuItems = await MenuItem.find({
            _id: { $in: menuItemIds },
            restaurant: restaurantId,
            ...filter,
            isAvailable: true,
        });

        if (menuItems.length !== menuItemIds.length) {
            throw { status: 400, message: 'One or more menu items are invalid, unavailable, or not in your country.' };
        }

        // Build order items with price snapshots
        const menuMap = new Map(menuItems.map((m) => [m._id.toString(), m]));
        let totalAmount = 0;

        const orderItems = items.map((item) => {
            const mi = menuMap.get(item.menuItemId);
            const qty = parseInt(item.quantity, 10) || 1;
            totalAmount += mi.price * qty;
            return { menuItem: mi._id, name: mi.name, quantity: qty, price: mi.price };
        });

        const order = await Order.create({
            user: user._id,
            restaurant: restaurantId,
            items: orderItems,
            country: user.country,
            totalAmount,
        });

        return successResponse({ message: 'Order created successfully', data: { order } }, 201);
    } catch (err) {
        return errorResponse(err);
    }
}
