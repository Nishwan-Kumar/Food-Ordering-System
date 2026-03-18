import connectDB from '@/lib/db';
import Restaurant from '@/lib/models/Restaurant';
import MenuItem from '@/lib/models/MenuItem';
import { authenticate } from '@/lib/auth';
import { authorize, countryFilter } from '@/lib/rbac';
import { successResponse, errorResponse } from '@/lib/response';

/** GET /api/restaurants/[id]/menu */
export async function GET(request, { params }) {
    try {
        const user = await authenticate(request);
        authorize(user, 'view_restaurants');

        const { id } = await params;

        await connectDB();

        const filter = countryFilter(user);
        const restaurant = await Restaurant.findOne({ _id: id, ...filter });

        if (!restaurant) {
            throw { status: 404, message: 'Restaurant not found or not accessible in your country.' };
        }

        const menuItems = await MenuItem.find({
            restaurant: id,
            ...filter,
            isAvailable: true,
        }).sort({ category: 1, name: 1 });

        return successResponse({
            count: menuItems.length,
            data: { restaurant: restaurant.name, menuItems },
        });
    } catch (err) {
        return errorResponse(err);
    }
}
