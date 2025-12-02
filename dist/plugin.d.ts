import type { Config } from 'payload';
import type { AuthPluginConfig } from './types.js';
/**
 * Payload authentication plugin for external SSO cookie-based authentication
 *
 * This plugin integrates external SSO cookie authentication with Payload CMS,
 * allowing you to configure one or multiple user collections with cookie-based authentication.
 *
 * @param config - Plugin configuration
 * @returns A function that extends the Payload config
 *
 * @example
 * ```ts
 * import { authPlugin } from 'payload-auth-cookie'
 *
 * export default buildConfig({
 *   plugins: [
 *     authPlugin({
 *       name: 'admin',
 *       useAdmin: true,
 *       usersCollectionSlug: 'adminUsers',
 *       sso: {
 *         cookieName: process.env.SSO_COOKIE_NAME,
 *         loginUrl: process.env.SSO_LOGIN_URL,
 *         logoutUrl: process.env.SSO_LOGOUT_URL,
 *         sessionUrl: process.env.SSO_SESSION_URL,
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export declare function authPlugin(pluginConfig: AuthPluginConfig): (incomingConfig: Config) => Config;
