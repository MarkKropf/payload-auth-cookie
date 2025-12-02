import type { JWTVerificationConfig, SSOProviderConfig } from '../types.js';
/**
 * Create an SSO provider configuration from environment variables
 *
 * @param config - SSO configuration (typically from environment variables)
 * @returns Validated SSO provider configuration object
 *
 * @example
 * ```ts
 * import { createSSOProviderConfig } from 'payload-auth-cookie'
 *
 * // Using session URL validation
 * const ssoConfig = createSSOProviderConfig({
 *   cookieName: process.env.SSO_COOKIE_NAME!,
 *   loginUrl: process.env.SSO_LOGIN_URL!,
 *   logoutUrl: process.env.SSO_LOGOUT_URL!,
 *   sessionUrl: process.env.SSO_SESSION_URL!,
 * })
 *
 * // Using JWT verification (no session URL needed)
 * const ssoConfigWithJWT = createSSOProviderConfig({
 *   cookieName: process.env.SSO_COOKIE_NAME!,
 *   loginUrl: process.env.SSO_LOGIN_URL!,
 *   logoutUrl: process.env.SSO_LOGOUT_URL!,
 *   jwt: {
 *     secret: process.env.SSO_JWT_SECRET!,
 *   },
 * })
 *
 * export default buildConfig({
 *   plugins: [
 *     authPlugin({
 *       name: 'admin',
 *       useAdmin: true,
 *       usersCollectionSlug: 'admin-users',
 *       sso: ssoConfig,
 *     }),
 *   ],
 * })
 * ```
 */
export declare function createSSOProviderConfig(config: {
    cookieName: string;
    loginUrl: string;
    logoutUrl: string;
    sessionUrl?: string;
    jwt?: JWTVerificationConfig;
    timeoutMs?: number;
}): SSOProviderConfig;
