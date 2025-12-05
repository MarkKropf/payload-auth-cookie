import type { Config } from 'payload'

/**
 * Field mapping configuration for extracting user data from SSO responses
 */
export interface FieldMappingConfig {
  /**
   * Field path to extract the email from
   * @default 'email'
   * @example 'user.email' for nested paths
   */
  emailField?: string

  /**
   * Field path to extract a combined name from (e.g., "John Doe")
   * Use this instead of firstNameField/lastNameField when SSO returns a single name
   * @example 'name' or 'displayName'
   */
  nameField?: string

  /**
   * Field path to extract the first name from
   * @default 'firstName'
   */
  firstNameField?: string

  /**
   * Field path to extract the last name from
   * @default 'lastName'
   */
  lastNameField?: string

  /**
   * Field path to extract the profile picture URL from
   * @default 'profilePictureUrl'
   */
  profilePictureUrlField?: string

  /**
   * Field path to extract the email verified status from
   * @default 'emailVerified'
   */
  emailVerifiedField?: string

  /**
   * Field path to extract the last login timestamp from
   * @default 'lastLoginAt'
   */
  lastLoginAtField?: string
}

/**
 * JWT verification configuration for validating SSO cookies as JWTs
 */
export interface JWTVerificationConfig {
  /**
   * Secret key for verifying JWT signatures
   * For symmetric algorithms (HS256, HS384, HS512), this is the shared secret
   */
  secret: string

  /**
   * JWT algorithm used for signing
   * @default 'HS256'
   */
  algorithm?: 'HS256' | 'HS384' | 'HS512'

  /**
   * Expected issuer (iss claim) - if provided, will be validated
   */
  issuer?: string

  /**
   * Expected audience (aud claim) - if provided, will be validated
   */
  audience?: string
}

/**
 * SSO provider configuration for external cookie-based authentication
 */
export interface SSOProviderConfig {
  /**
   * Name of the cookie set by the external SSO system
   * @example 'supaku_session'
   */
  cookieName: string

  /**
   * External SSO login URL where users are redirected when not authenticated
   * The plugin will append a `returnUrl` query parameter
   * @example 'https://sso.example.com/login'
   */
  loginUrl: string

  /**
   * External SSO logout URL where users are redirected after signing out
   * The plugin will append a `returnUrl` query parameter
   * @example 'https://sso.example.com/logout'
   */
  logoutUrl: string

  /**
   * URL to call (server-side) to validate the SSO cookie and retrieve user info
   * The plugin will forward the SSO cookie and expect a JSON response with user data
   * Required if jwt is not provided
   * @example 'https://sso.example.com/api/session'
   */
  sessionUrl?: string

  /**
   * JWT verification configuration for validating the cookie as a JWT
   * If provided, the cookie will be verified as a JWT instead of calling sessionUrl
   */
  jwt?: JWTVerificationConfig

  /**
   * Timeout in milliseconds for the session URL validation call
   * @default 5000
   */
  timeoutMs?: number

  /**
   * Field mappings for extracting user data from SSO responses
   * Used by both JWT and sessionUrl validation paths
   */
  fieldMappings?: FieldMappingConfig
}

/**
 * Authentication plugin configuration
 */
export interface AuthPluginConfig {
  /**
   * Unique name for this auth configuration
   * Used to namespace routes and identify the auth instance
   * @example 'admin' or 'app'
   */
  name: string

  /**
   * Whether to use this configuration for admin panel authentication
   * @default false
   */
  useAdmin?: boolean

  /**
   * Automatically inject default admin login/logout UI components.
   * Only applies when useAdmin is true.
   * Set to false to provide your own components.
   * @default true
   */
  autoInjectAdminUI?: boolean

  /**
   * Whether to allow new user sign-ups when a user authenticates but doesn't exist in the collection
   * @default false
   */
  allowSignUp?: boolean

  /**
   * Slug of the users collection to authenticate against
   */
  usersCollectionSlug: string

  /**
   * Path to redirect to after successful authentication
   * @default '/'
   */
  successRedirectPath?: string

  /**
   * Path to redirect to on authentication error
   * @default '/auth/error'
   */
  errorRedirectPath?: string

  /**
   * SSO provider configuration
   */
  sso: SSOProviderConfig

  /**
   * Custom callback handler for after user is authenticated
   * Receives the user object and SSO session data
   */
  onSuccess?: (args: {
    user: Record<string, unknown>
    session: Record<string, unknown>
    req: Request
  }) => Promise<void> | void

  /**
   * Custom error handler
   */
  onError?: (args: {
    error: Error
    req: Request
  }) => Promise<void> | void
}

/**
 * Plugin function type
 */
export type AuthPlugin = (config: AuthPluginConfig) => (incomingConfig: Config) => Config
