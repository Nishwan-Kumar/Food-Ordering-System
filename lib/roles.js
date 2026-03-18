/**
 * Central Role-Permission Configuration (same as before).
 */
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    MEMBER: 'member',
};

export const COUNTRIES = {
    INDIA: 'india',
    AMERICA: 'america',
};

export const PERMISSIONS = {
    view_restaurants: [ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER],
    create_order: [ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER],
    checkout_order: [ROLES.ADMIN, ROLES.MANAGER],
    cancel_order: [ROLES.ADMIN, ROLES.MANAGER],
    update_payment: [ROLES.ADMIN],
};
