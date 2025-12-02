import type { Payload } from 'payload';
import type { SSOProviderConfig } from '../types.js';
/**
 * Cookie-based authentication strategy for Payload v3
 *
 * This strategy validates the external SSO cookie directly on each request,
 * completely bypassing Payload's built-in token/session system.
 *
 * @param collectionSlug - The slug of the users collection
 * @param ssoConfig - SSO provider configuration for cookie validation
 */
export declare function createCookieAuthStrategy(collectionSlug: string, ssoConfig: SSOProviderConfig): {
    name: string;
    authenticate: ({ headers, payload }: {
        headers: Headers;
        payload: Payload;
    }) => Promise<{
        user: null;
    } | {
        user: {
            _strategy: string;
            collection: any;
            id: number | string;
        };
    }>;
};
