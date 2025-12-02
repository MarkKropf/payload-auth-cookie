/**
 * React Server Component exports for the Payload Auth Cookie plugin
 * These exports are used for server-side rendering in Next.js
 */ export { authPlugin } from '../plugin.js';
export { generateUserToken, getExpiredPayloadCookie, getExpiredPayloadCookies, getPayloadCookie, getPayloadCookies } from '../lib/session.js';
export { createCookieAuthStrategy } from '../lib/strategy.js';
export { fetchSSOSession, getEmailFromSession, parseCookies, validateSSOConfig, validateSSOSession, verifyJWTSession } from '../lib/sso-session.js';
export { createSSOProviderConfig } from '../lib/helpers.js';
