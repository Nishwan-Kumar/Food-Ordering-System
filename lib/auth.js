import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';
import connectDB from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT token for a user ID.
 */
export function signToken(id) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Authenticate a request by extracting and verifying the JWT.
 * Returns the full user document or throws a Response-ready error.
 *
 * Usage in API routes:
 *   const user = await authenticate(request);
 */
export async function authenticate(request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw { status: 401, message: 'Authentication required. Please log in.' };
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        const msg =
            err.name === 'TokenExpiredError'
                ? 'Token expired. Please log in again.'
                : 'Invalid token. Please log in again.';
        throw { status: 401, message: msg };
    }

    await connectDB();
    const user = await User.findById(decoded.id);

    if (!user) {
        throw { status: 401, message: 'User belonging to this token no longer exists.' };
    }

    return user;
}
