import { jwtVerify } from 'jose'
import type { FieldMappingConfig, JWTVerificationConfig, SSOProviderConfig } from '../types.js'

/**
 * Session data returned from the external SSO session validation endpoint
 */
export interface SSOSessionData {
  email: string
  name?: string
  firstName?: string
  lastName?: string
  profilePictureUrl?: string
  emailVerified?: boolean
  lastLoginAt?: string
  [key: string]: unknown
}

/**
 * Parse cookies from a Headers object
 */
export function parseCookies(headers: Headers): Record<string, string> {
  const cookieHeader = headers.get('cookie')
  if (!cookieHeader) {
    return {}
  }

  return cookieHeader.split(';').reduce(
    (acc, part) => {
      const [key, ...rest] = part.trim().split('=')
      if (key) {
        acc[key] = rest.join('=')
      }
      return acc
    },
    {} as Record<string, string>,
  )
}

/**
 * Get a nested value from an object using dot notation
 * @example getNestedValue({ user: { email: 'test@example.com' } }, 'user.email') => 'test@example.com'
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Extract session data from a raw data object using field mappings
 */
function extractSessionData(
  data: Record<string, unknown>,
  fieldMappings?: FieldMappingConfig,
): SSOSessionData | null {
  const emailField = fieldMappings?.emailField || 'email'
  const nameField = fieldMappings?.nameField
  const firstNameField = fieldMappings?.firstNameField || 'firstName'
  const lastNameField = fieldMappings?.lastNameField || 'lastName'
  const profilePictureUrlField = fieldMappings?.profilePictureUrlField || 'profilePictureUrl'
  const emailVerifiedField = fieldMappings?.emailVerifiedField || 'emailVerified'
  const lastLoginAtField = fieldMappings?.lastLoginAtField || 'lastLoginAt'

  const email = getNestedValue(data, emailField)
  if (typeof email !== 'string' || email.length === 0) {
    return null
  }

  const name = nameField ? getNestedValue(data, nameField) : undefined
  const firstName = getNestedValue(data, firstNameField)
  const lastName = getNestedValue(data, lastNameField)
  const profilePictureUrl = getNestedValue(data, profilePictureUrlField)
  const emailVerified = getNestedValue(data, emailVerifiedField)
  const lastLoginAt = getNestedValue(data, lastLoginAtField)

  let parsedEmailVerified: boolean | undefined
  if (typeof emailVerified === 'boolean') {
    parsedEmailVerified = emailVerified
  } else if (typeof emailVerified === 'string') {
    parsedEmailVerified = emailVerified.toLowerCase() === 'true'
  }

  let parsedLastLoginAt: string | undefined
  if (typeof lastLoginAt === 'string' && lastLoginAt.length > 0) {
    parsedLastLoginAt = lastLoginAt
  } else if (typeof lastLoginAt === 'number') {
    parsedLastLoginAt = new Date(lastLoginAt * 1000).toISOString()
  }

  return {
    email,
    name: typeof name === 'string' ? name : undefined,
    firstName: typeof firstName === 'string' ? firstName : undefined,
    lastName: typeof lastName === 'string' ? lastName : undefined,
    profilePictureUrl: typeof profilePictureUrl === 'string' ? profilePictureUrl : undefined,
    emailVerified: parsedEmailVerified,
    lastLoginAt: parsedLastLoginAt,
    ...data,
  }
}

/**
 * Verify a JWT token and extract session data
 *
 * @param token - The JWT token to verify
 * @param jwtConfig - JWT verification configuration
 * @param fieldMappings - Field mappings for extracting user data
 * @returns The session data if valid, null if invalid or expired
 */
export async function verifyJWTSession(
  token: string,
  jwtConfig: JWTVerificationConfig,
  fieldMappings?: FieldMappingConfig,
): Promise<SSOSessionData | null> {
  try {
    const secretKey = new TextEncoder().encode(jwtConfig.secret)
    const algorithm = jwtConfig.algorithm || 'HS256'

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    })

    return extractSessionData(payload as Record<string, unknown>, fieldMappings)
  } catch {
    return null
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
 */
export async function fetchSSOSession(
  config: SSOProviderConfig,
  cookieValue: string,
): Promise<SSOSessionData | null> {
  if (!config.sessionUrl) {
    return null
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 5000)

  try {
    const response = await fetch(config.sessionUrl, {
      method: 'GET',
      headers: {
        cookie: `${config.cookieName}=${cookieValue}`,
        Accept: 'application/json',
      },
      credentials: 'include',
      signal: controller.signal,
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    // Handle common response patterns:
    // 1. { authenticated: true, user: { email, ... } }
    // 2. { user: { email, ... } }
    // 3. { email, ... } (direct user data)
    const userData = data.user && typeof data.user === 'object' ? data.user : data

    return extractSessionData(userData as Record<string, unknown>, config.fieldMappings)
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
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
 */
export async function validateSSOSession(
  config: SSOProviderConfig,
  cookieValue: string,
): Promise<SSOSessionData | null> {
  if (config.jwt) {
    return verifyJWTSession(cookieValue, config.jwt, config.fieldMappings)
  }

  return fetchSSOSession(config, cookieValue)
}

/**
 * Extract the email from the SSO session data
 *
 * @param session - The session data from the SSO provider
 * @returns The email if present and valid, null otherwise
 */
export function getEmailFromSession(session: Record<string, unknown> | null): string | null {
  if (!session) {
    return null
  }

  const email = session.email
  return typeof email === 'string' && email.length > 0 ? email : null
}

/**
 * Validate the SSO provider configuration
 *
 * @param config - SSO provider configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateSSOConfig(config: SSOProviderConfig): void {
  if (!config.cookieName || config.cookieName.trim() === '') {
    throw new Error('SSO cookieName is required')
  }
  if (!config.loginUrl || config.loginUrl.trim() === '') {
    throw new Error('SSO loginUrl is required')
  }
  if (!config.logoutUrl || config.logoutUrl.trim() === '') {
    throw new Error('SSO logoutUrl is required')
  }

  if (!config.jwt && (!config.sessionUrl || config.sessionUrl.trim() === '')) {
    throw new Error('SSO sessionUrl is required when jwt verification is not configured')
  }

  if (config.jwt && (!config.jwt.secret || config.jwt.secret.trim() === '')) {
    throw new Error('SSO jwt.secret is required when jwt verification is configured')
  }
}
