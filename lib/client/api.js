'use client';

/**
 * Client-side API helper.
 * Since API routes are on the same Next.js server,
 * we just fetch /api/* directly — no proxy needed.
 */

export async function api(path, options = {}) {
    const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const res = await fetch(`/api${path}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}

export function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
}

export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
