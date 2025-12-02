import { jwtVerify } from 'jose';
/**
 * Parse cookies from a Headers object
 */ export function parseCookies(headers) {
    const cookieHeader = headers.get('cookie');
    if (!cookieHeader) {
        return {};
    }
    return cookieHeader.split(';').reduce((acc, part)=>{
        const [key, ...rest] = part.trim().split('=');
        if (key) {
            acc[key] = rest.join('=');
        }
        return acc;
    }, {});
}
/**
 * Get a nested value from an object using dot notation
 * @example getNestedValue({ user: { email: 'test@example.com' } }, 'user.email') => 'test@example.com'
 */ function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key)=>{
        if (current && typeof current === 'object' && key in current) {
            return current[key];
        }
        return undefined;
    }, obj);
}
/**
 * Verify a JWT token and extract session data
 *
 * @param token - The JWT token to verify
 * @param jwtConfig - JWT verification configuration
 * @returns The session data if valid, null if invalid or expired
 */ export async function verifyJWTSession(token, jwtConfig) {
    try {
        const secretKey = new TextEncoder().encode(jwtConfig.secret);
        const algorithm = jwtConfig.algorithm || 'HS256';
        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: [
                algorithm
            ],
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience
        });
        const emailField = jwtConfig.emailField || 'email';
        const firstNameField = jwtConfig.firstNameField || 'firstName';
        const lastNameField = jwtConfig.lastNameField || 'lastName';
        const profilePictureUrlField = jwtConfig.profilePictureUrlField || 'profilePictureUrl';
        const email = getNestedValue(payload, emailField);
        if (typeof email !== 'string' || email.length === 0) {
            return null;
        }
        const firstName = getNestedValue(payload, firstNameField);
        const lastName = getNestedValue(payload, lastNameField);
        const profilePictureUrl = getNestedValue(payload, profilePictureUrlField);
        return {
            email,
            firstName: typeof firstName === 'string' ? firstName : undefined,
            lastName: typeof lastName === 'string' ? lastName : undefined,
            profilePictureUrl: typeof profilePictureUrl === 'string' ? profilePictureUrl : undefined,
            ...payload
        };
    } catch  {
        return null;
    }
}
/**
 * Fetch and validate the SSO session from the external session endpoint
 *
 * This calls the configured sessionUrl with the SSO cookie to validate
 * the session and retrieve user information.
 *
 * @param config - SSO provider configuration
 * @param cookieValue - The value of the SSO cookie
 * @returns The session data if valid, null if invalid or expired
 */ export async function fetchSSOSession(config, cookieValue) {
    if (!config.sessionUrl) {
        return null;
    }
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), config.timeoutMs ?? 5000);
    try {
        const response = await fetch(config.sessionUrl, {
            method: 'GET',
            headers: {
                cookie: `${config.cookieName}=${cookieValue}`,
                Accept: 'application/json'
            },
            credentials: 'include',
            signal: controller.signal
        });
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        // Handle common response patterns:
        // 1. { authenticated: true, user: { email, ... } }
        // 2. { user: { email, ... } }
        // 3. { email, ... } (direct user data)
        if (data.user && typeof data.user === 'object') {
            return data.user;
        }
        return data;
    } catch  {
        return null;
    } finally{
        clearTimeout(timeout);
    }
}
/**
 * Validate the SSO session using either JWT verification or session URL
 *
 * If JWT configuration is provided, verifies the cookie as a JWT.
 * Otherwise, calls the session URL to validate.
 *
 * @param config - SSO provider configuration
 * @param cookieValue - The value of the SSO cookie
 * @returns The session data if valid, null if invalid or expired
 */ export async function validateSSOSession(config, cookieValue) {
    if (config.jwt) {
        return verifyJWTSession(cookieValue, config.jwt);
    }
    return fetchSSOSession(config, cookieValue);
}
/**
 * Extract the email from the SSO session data
 *
 * @param session - The session data from the SSO provider
 * @returns The email if present and valid, null otherwise
 */ export function getEmailFromSession(session) {
    if (!session) {
        return null;
    }
    const email = session.email;
    return typeof email === 'string' && email.length > 0 ? email : null;
}
/**
 * Validate the SSO provider configuration
 *
 * @param config - SSO provider configuration to validate
 * @throws Error if configuration is invalid
 */ export function validateSSOConfig(config) {
    if (!config.cookieName || config.cookieName.trim() === '') {
        throw new Error('SSO cookieName is required');
    }
    if (!config.loginUrl || config.loginUrl.trim() === '') {
        throw new Error('SSO loginUrl is required');
    }
    if (!config.logoutUrl || config.logoutUrl.trim() === '') {
        throw new Error('SSO logoutUrl is required');
    }
    if (!config.jwt && (!config.sessionUrl || config.sessionUrl.trim() === '')) {
        throw new Error('SSO sessionUrl is required when jwt verification is not configured');
    }
    if (config.jwt && (!config.jwt.secret || config.jwt.secret.trim() === '')) {
        throw new Error('SSO jwt.secret is required when jwt verification is configured');
    }
}
