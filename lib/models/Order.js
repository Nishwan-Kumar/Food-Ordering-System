import mongoose from 'mongoose';
import { COUNTRIES } from '@/lib/roles';

const orderItemSchema = new mongoose.Schema(
    {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
        items: {
            type: [orderItemSchema],
            validate: { validator: (v) => v.length > 0, message: 'Order must have at least one item' },
        },
        country: {
            type: String,
            enum: Object.values(COUNTRIES),
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'upi'],
            default: 'cash',
        },
        totalAmount: { type: Number, required: true, min: 0 },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
