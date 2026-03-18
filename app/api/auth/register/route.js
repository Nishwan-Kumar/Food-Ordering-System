import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

/** POST /api/auth/register */
export async function POST(request) {
    try {
        const { name, email, password, role, country } = await request.json();

        if (!name || !email || !password || !country) {
            throw { status: 400, message: 'Name, email, password, and country are required.' };
        }

        await connectDB();

        const existing = await User.findOne({ email });
        if (existing) {
            throw { status: 400, message: 'A user with this email already exists.' };
        }

        const user = await User.create({ name, email, password, role, country });
        const token = signToken(user._id);

        const userObj = user.toObject();
        delete userObj.password;

        return successResponse({ token, data: { user: userObj } }, 201);
    } catch (err) {
        return errorResponse(err);
    }
}
