import type { JWTVerificationConfig, SSOProviderConfig } from '../types.js';
/**
 * Session data returned from the external SSO session validation endpoint
 */
export interface SSOSessionData {
    email: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    [key: string]: unknown;
}
/**
 * Parse cookies from a Headers object
 */
export declare function parseCookies(headers: Headers): Record<string, string>;
/**
 * Verify a JWT token and extract session data
 *
 * @param token - The JWT token to verify
 * @param jwtConfig - JWT verification configuration
 * @returns The session data if valid, null if invalid or expired
 */
export declare function verifyJWTSession(token: string, jwtConfig: JWTVerificationConfig): Promise<SSOSessionData | null>;
/**
 * Fetch and validate the SSO session from the external session endpoint
 *
 * This calls the configured sessionUrl with the SSO cookie to validate
 * the session and retrieve user information.
 *
 * @param config - SSO provider configuration
 * @param cookieValue - The value of the SSO cookie
 * @returns The session data if valid, null if invalid or expired
 */
export declare function fetchSSOSession(config: SSOProviderConfig, cookieValue: string): Promise<SSOSessionData | null>;
/**
 * Validate the SSO session using either JWT verification or session URL
 *
 * If JWT configuration is provided, verifies the cookie as a JWT.
 * Otherwise, calls the session URL to validate.
 *
 * @param config - SSO provider configuration
 * @param cookieValue - The value of the SSO cookie
 * @returns The session data if valid, null if invalid or expired
 */
export declare function validateSSOSession(config: SSOProviderConfig, cookieValue: string): Promise<SSOSessionData | null>;
/**
 * Extract the email from the SSO session data
 *
 * @param session - The session data from the SSO provider
 * @returns The email if present and valid, null otherwise
 */
export declare function getEmailFromSession(session: Record<string, unknown> | null): string | null;
/**
 * Validate the SSO provider configuration
 *
 * @param config - SSO provider configuration to validate
 * @throws Error if configuration is invalid
 */
export declare function validateSSOConfig(config: SSOProviderConfig): void;
