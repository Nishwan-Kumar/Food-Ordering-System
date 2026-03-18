import mongoose from 'mongoose';

/**
 * Cached MongoDB connection for Next.js.
 *
 * In serverless/edge environments, each API route invocation may
 * create a new connection. We cache the connection on `global` to
 * reuse it across hot-reloads in development and across requests
 * in production.
 */

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    throw new Error('Please define MONGO_URI in .env.local');
}

let cached = global._mongooseCache;

if (!cached) {
    cached = global._mongooseCache = { conn: null, promise: null };
}

export default async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI).then((m) => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
