import { NextResponse } from 'next/server';

/**
 * Consistent JSON error response helper.
 * Catches the structured errors thrown by auth/rbac helpers.
 */
export function errorResponse(err) {
    const status = err.status || 500;
    const message = err.message || 'Internal server error';

    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

/**
 * Consistent JSON success response helper.
 */
export function successResponse(data, status = 200) {
    return NextResponse.json(
        { success: true, ...data },
        { status }
    );
}
