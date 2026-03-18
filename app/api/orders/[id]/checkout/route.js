import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { authenticate } from '@/lib/auth';
import { authorize, countryFilter } from '@/lib/rbac';
import { successResponse, errorResponse } from '@/lib/response';

/** POST /api/orders/[id]/checkout — confirm an order */
export async function POST(request, { params }) {
    try {
        const user = await authenticate(request);
        authorize(user, 'checkout_order'); // Admin + Manager only

        const { id } = await params;

        await connectDB();

        const order = await Order.findOne({ _id: id, ...countryFilter(user) });

        if (!order) {
            throw { status: 404, message: 'Order not found or not accessible in your country.' };
        }

        if (order.status !== 'pending') {
            throw { status: 400, message: `Cannot checkout order with status '${order.status}'.` };
        }

        order.status = 'confirmed';
        await order.save();

        return successResponse({ message: 'Order checked out successfully', data: { order } });
    } catch (err) {
        return errorResponse(err);
    }
}
