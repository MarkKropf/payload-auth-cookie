import type { CollectionConfig, Field } from 'payload';
/**
 * Higher-order function that configures a collection for SSO cookie-based user management
 *
 * This function takes a partial collection configuration and returns a complete
 * collection config with all necessary fields for SSO cookie auth. The auth strategy
 * is added by the authPlugin, not by this function.
 *
 * @param incomingCollection - Partial collection config (fields are optional)
 * @returns Complete collection configuration
 *
 * @example
 * ```ts
 * export const Users: CollectionConfig = withUsersCollection({
 *   slug: 'users',
 *   // Optional: add custom fields, hooks, access control, etc.
 * })
 * ```
 */
export declare const withUsersCollection: (incomingCollection: Omit<CollectionConfig, "fields"> & {
    fields?: Field[];
}) => CollectionConfig;
