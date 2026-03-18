import mongoose from 'mongoose';
import { COUNTRIES } from '@/lib/roles';

const restaurantSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 150 },
        address: { type: String, required: true, trim: true },
        cuisine: { type: String, trim: true },
        country: {
            type: String,
            enum: Object.values(COUNTRIES),
            required: true,
            index: true,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.models.Restaurant ||
    mongoose.model('Restaurant', restaurantSchema);
