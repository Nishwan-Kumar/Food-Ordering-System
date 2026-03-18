import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { authenticate } from '@/lib/auth';
import { authorize, countryFilter } from '@/lib/rbac';
import { successResponse, errorResponse } from '@/lib/response';

/** PUT /api/orders/[id]/payment — update payment method (Admin only) */
export async function PUT(request, { params }) {
    try {
        const user = await authenticate(request);
        authorize(user, 'update_payment'); // Admin only

        const { id } = await params;
        const { paymentMethod } = await request.json();

        const validMethods = ['cash', 'card', 'upi'];
        if (!paymentMethod || !validMethods.includes(paymentMethod)) {
            throw { status: 400, message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` };
        }

        await connectDB();

        const order = await Order.findOne({ _id: id, ...countryFilter(user) });

        if (!order) {
            throw { status: 404, message: 'Order not found or not accessible in your country.' };
        }

        if (order.status === 'cancelled') {
            throw { status: 400, message: 'Cannot update payment method on a cancelled order.' };
        }

        order.paymentMethod = paymentMethod;
        await order.save();

        return successResponse({
            message: `Payment method updated to '${paymentMethod}'`,
            data: { order },
        });
    } catch (err) {
        return errorResponse(err);
    }
}
