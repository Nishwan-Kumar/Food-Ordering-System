import { PERMISSIONS } from '@/lib/roles';

/**
 * Check if a user's role has the required permission.
 * Throws a structured error if denied.
 *
 * @param {Object} user - The authenticated user document
 * @param {string} permissionKey - Key from PERMISSIONS map
 */
export function authorize(user, permissionKey) {
    const allowedRoles = PERMISSIONS[permissionKey];

    if (!allowedRoles) {
        throw { status: 500, message: 'Permission not configured on server.' };
    }

    if (!allowedRoles.includes(user.role)) {
        throw {
            status: 403,
            message: `Access denied. Role '${user.role}' is not authorized for this action.`,
        };
    }
}

/**
 * Returns a Mongoose filter object scoping queries to the user's country.
 * @param {Object} user - The authenticated user document
 * @returns {{ country: string }}
 */
export function countryFilter(user) {
    return { country: user.country };
}
