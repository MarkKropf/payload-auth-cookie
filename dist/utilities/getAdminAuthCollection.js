let adminAuthCollectionSlug;
export function setAdminAuthCollectionSlug(slug) {
    adminAuthCollectionSlug = slug;
}
/**
 * Get the auth collection slug that is configured with useAdmin: true
 * This dynamically detects which collection is used for admin authentication
 */ export async function getAdminAuthCollection() {
    if (adminAuthCollectionSlug) {
        return adminAuthCollectionSlug;
    }
    // Fallback to 'users' if not configured
    return 'users';
}
