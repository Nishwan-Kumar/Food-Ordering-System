import mongoose from 'mongoose';
import { COUNTRIES } from '@/lib/roles';

const menuItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        price: { type: Number, required: true, min: 0 },
        category: {
            type: String,
            enum: ['starter', 'main', 'dessert', 'beverage', 'side'],
            default: 'main',
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
            index: true,
        },
        country: {
            type: String,
            enum: Object.values(COUNTRIES),
            required: true,
            index: true,
        },
        isAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.models.MenuItem ||
    mongoose.model('MenuItem', menuItemSchema);
