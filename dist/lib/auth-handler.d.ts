import type { Payload } from 'payload';
import type { AuthPluginConfig } from '../types.js';
import type { SSOSessionData } from './sso-session.js';
/**
 * Handle SSO login and create/update user in Payload
 *
 * This function takes the validated SSO session data and either:
 * 1. Finds an existing user by email and updates their profile
 * 2. Creates a new user if allowSignUp is enabled
 * 3. Throws an error if user doesn't exist and sign-up is disabled
 */
export declare function handleSSOLogin(payload: Payload, config: AuthPluginConfig, session: SSOSessionData, req: Request): Promise<{
    user: Record<string, unknown> & {
        id: string | number;
    };
}>;
