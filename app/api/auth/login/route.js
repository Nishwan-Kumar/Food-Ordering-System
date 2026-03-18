import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

/** POST /api/auth/login */
export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            throw { status: 400, message: 'Email and password are required.' };
        }

        await connectDB();

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            throw { status: 401, message: 'Invalid email or password.' };
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw { status: 401, message: 'Invalid email or password.' };
        }

        const token = signToken(user._id);

        const userObj = user.toObject();
        delete userObj.password;

        return successResponse({ token, data: { user: userObj } });
    } catch (err) {
        return errorResponse(err);
    }
}
