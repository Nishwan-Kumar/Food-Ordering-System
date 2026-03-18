import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, COUNTRIES } from '@/lib/roles';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: {
            type: String, required: true, unique: true,
            lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/,
        },
        password: { type: String, required: true, minlength: 6, select: false },
        role: {
            type: String,
            enum: Object.values(ROLES),
            default: ROLES.MEMBER,
        },
        country: {
            type: String,
            enum: Object.values(COUNTRIES),
            required: true,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

export default mongoose.models.User || mongoose.model('User', userSchema);
