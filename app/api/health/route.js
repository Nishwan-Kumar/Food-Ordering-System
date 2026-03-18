import { NextResponse } from 'next/server';

/** GET /api/health */
export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Food Ordering API is running',
        timestamp: new Date().toISOString(),
    });
}
