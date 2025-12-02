import { createUsersCollection } from '../collections/createUsersCollection.js';
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
 */ export const withUsersCollection = (incomingCollection)=>{
    const baseConfig = createUsersCollection(incomingCollection.slug, false);
    const baseFields = baseConfig.fields || [];
    const existingFieldNames = new Set((incomingCollection.fields || []).map((f)=>'name' in f ? f.name : null));
    const newFields = baseFields.filter((f)=>{
        const name = 'name' in f ? f.name : null;
        return name && !existingFieldNames.has(name);
    });
    const fields = [
        ...incomingCollection.fields || [],
        ...newFields
    ];
    return {
        ...incomingCollection,
        fields,
        admin: {
            ...baseConfig.admin,
            ...incomingCollection.admin
        }
    };
};
