import { parseCookies, validateSSOSession, getEmailFromSession } from './sso-session.js';
/**
 * Cookie-based authentication strategy for Payload v3
 *
 * This strategy validates the external SSO cookie directly on each request,
 * completely bypassing Payload's built-in token/session system.
 *
 * @param collectionSlug - The slug of the users collection
 * @param ssoConfig - SSO provider configuration for cookie validation
 */ export function createCookieAuthStrategy(collectionSlug, ssoConfig) {
    return {
        name: 'sso-cookie',
        authenticate: async ({ headers, payload })=>{
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload's collections object uses dynamic keys
                const collection = payload.collections[collectionSlug];
                if (!collection || !collection.config.auth) {
                    return {
                        user: null
                    };
                }
                const origin = headers.get('Origin');
                if (origin && payload.config.csrf && payload.config.csrf.length > 0 && !payload.config.csrf.includes(origin)) {
                    return {
                        user: null
                    };
                }
                const cookies = parseCookies(headers);
                const ssoCookie = cookies[ssoConfig.cookieName];
                if (!ssoCookie) {
                    return {
                        user: null
                    };
                }
                const session = await validateSSOSession(ssoConfig, ssoCookie);
                if (!session) {
                    return {
                        user: null
                    };
                }
                const email = getEmailFromSession(session);
                if (!email) {
                    return {
                        user: null
                    };
                }
                const users = await payload.find({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug parameter
                    collection: collectionSlug,
                    where: {
                        email: {
                            equals: email
                        }
                    },
                    limit: 1
                });
                if (!users.docs.length) {
                    return {
                        user: null
                    };
                }
                const user = users.docs[0];
                return {
                    user: {
                        ...user,
                        _strategy: 'sso-cookie',
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug parameter for user augmentation
                        collection: collectionSlug
                    }
                };
            } catch  {
                return {
                    user: null
                };
            }
        }
    };
}
