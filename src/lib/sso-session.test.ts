import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SignJWT } from 'jose'
import {
  parseCookies,
  fetchSSOSession,
  getEmailFromSession,
  validateSSOConfig,
  verifyJWTSession,
  validateSSOSession,
} from './sso-session.js'

describe('parseCookies', () => {
  it('should parse cookies from headers', () => {
    const headers = new Headers()
    headers.set('cookie', 'session=abc123; user=john; token=xyz')

    const cookies = parseCookies(headers)

    expect(cookies).toEqual({
      session: 'abc123',
      user: 'john',
      token: 'xyz',
    })
  })

  it('should return empty object when no cookies', () => {
    const headers = new Headers()
    const cookies = parseCookies(headers)
    expect(cookies).toEqual({})
  })

  it('should handle cookies with equals in value', () => {
    const headers = new Headers()
    headers.set('cookie', 'token=abc=def=ghi')

    const cookies = parseCookies(headers)
    expect(cookies.token).toBe('abc=def=ghi')
  })
})

describe('getEmailFromSession', () => {
  it('should extract email from session', () => {
    const session = { email: 'test@example.com', name: 'Test' }
    expect(getEmailFromSession(session)).toBe('test@example.com')
  })

  it('should return null for missing email', () => {
    const session = { name: 'Test' }
    expect(getEmailFromSession(session)).toBeNull()
  })

  it('should return null for empty email', () => {
    const session = { email: '' }
    expect(getEmailFromSession(session)).toBeNull()
  })

  it('should return null for non-string email', () => {
    const session = { email: 123 }
    expect(getEmailFromSession(session)).toBeNull()
  })

  it('should return null for null session', () => {
    expect(getEmailFromSession(null)).toBeNull()
  })
})

describe('validateSSOConfig', () => {
  it('should pass with valid sessionUrl config', () => {
    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: 'https://sso.example.com/session',
    }

    expect(() => validateSSOConfig(config)).not.toThrow()
  })

  it('should pass with valid jwt config', () => {
    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      jwt: {
        secret: 'my-super-secret-key-that-is-long-enough',
      },
    }

    expect(() => validateSSOConfig(config)).not.toThrow()
  })

  it('should throw for missing cookieName', () => {
    const config = {
      cookieName: '',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: 'https://sso.example.com/session',
    }

    expect(() => validateSSOConfig(config)).toThrow('SSO cookieName is required')
  })

  it('should throw for missing loginUrl', () => {
    const config = {
      cookieName: 'session',
      loginUrl: '',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: 'https://sso.example.com/session',
    }

    expect(() => validateSSOConfig(config)).toThrow('SSO loginUrl is required')
  })

  it('should throw for missing logoutUrl', () => {
    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: '',
      sessionUrl: 'https://sso.example.com/session',
    }

    expect(() => validateSSOConfig(config)).toThrow('SSO logoutUrl is required')
  })

  it('should throw for missing sessionUrl when jwt not configured', () => {
    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: '',
    }

    expect(() => validateSSOConfig(config)).toThrow(
      'SSO sessionUrl is required when jwt verification is not configured',
    )
  })

  it('should throw for missing jwt.secret when jwt is configured', () => {
    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      jwt: {
        secret: '',
      },
    }

    expect(() => validateSSOConfig(config)).toThrow(
      'SSO jwt.secret is required when jwt verification is configured',
    )
  })
})

describe('verifyJWTSession', () => {
  const secret = 'my-super-secret-key-that-is-long-enough-for-hs256'

  async function createTestJWT(
    payload: Record<string, unknown>,
    options?: { algorithm?: 'HS256' | 'HS384' | 'HS512'; issuer?: string; audience?: string },
  ) {
    const secretKey = new TextEncoder().encode(secret)
    const alg = options?.algorithm || 'HS256'

    let builder = new SignJWT(payload).setProtectedHeader({ alg }).setIssuedAt()

    if (options?.issuer) {
      builder = builder.setIssuer(options.issuer)
    }
    if (options?.audience) {
      builder = builder.setAudience(options.audience)
    }

    return builder.sign(secretKey)
  }

  it('should verify valid JWT and extract session data', async () => {
    const token = await createTestJWT({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      profilePictureUrl: 'https://example.com/avatar.jpg',
    })

    const result = await verifyJWTSession(token, { secret })

    expect(result).not.toBeNull()
    expect(result?.email).toBe('test@example.com')
    expect(result?.firstName).toBe('John')
    expect(result?.lastName).toBe('Doe')
    expect(result?.profilePictureUrl).toBe('https://example.com/avatar.jpg')
  })

  it('should extract email from nested field path', async () => {
    const token = await createTestJWT({
      user: {
        email: 'nested@example.com',
        profile: {
          firstName: 'Jane',
        },
      },
    })

    const result = await verifyJWTSession(token, {
      secret,
      emailField: 'user.email',
      firstNameField: 'user.profile.firstName',
    })

    expect(result).not.toBeNull()
    expect(result?.email).toBe('nested@example.com')
    expect(result?.firstName).toBe('Jane')
  })

  it('should return null for invalid signature', async () => {
    const token = await createTestJWT({ email: 'test@example.com' })

    const result = await verifyJWTSession(token, { secret: 'wrong-secret' })

    expect(result).toBeNull()
  })

  it('should return null for missing email', async () => {
    const token = await createTestJWT({ name: 'Test' })

    const result = await verifyJWTSession(token, { secret })

    expect(result).toBeNull()
  })

  it('should validate issuer when provided', async () => {
    const token = await createTestJWT({ email: 'test@example.com' }, { issuer: 'https://sso.example.com' })

    const validResult = await verifyJWTSession(token, {
      secret,
      issuer: 'https://sso.example.com',
    })
    expect(validResult).not.toBeNull()

    const invalidResult = await verifyJWTSession(token, {
      secret,
      issuer: 'https://other.example.com',
    })
    expect(invalidResult).toBeNull()
  })

  it('should validate audience when provided', async () => {
    const token = await createTestJWT({ email: 'test@example.com' }, { audience: 'my-app' })

    const validResult = await verifyJWTSession(token, {
      secret,
      audience: 'my-app',
    })
    expect(validResult).not.toBeNull()

    const invalidResult = await verifyJWTSession(token, {
      secret,
      audience: 'other-app',
    })
    expect(invalidResult).toBeNull()
  })

  it('should return null for malformed JWT', async () => {
    const result = await verifyJWTSession('not-a-valid-jwt', { secret })
    expect(result).toBeNull()
  })
})

describe('validateSSOSession', () => {
  const secret = 'my-super-secret-key-that-is-long-enough-for-hs256'
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.useRealTimers()
  })

  it('should use JWT verification when jwt config is provided', async () => {
    const secretKey = new TextEncoder().encode(secret)
    const token = await new SignJWT({ email: 'jwt@example.com' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secretKey)

    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      jwt: { secret },
    }

    const result = await validateSSOSession(config, token)

    expect(result).not.toBeNull()
    expect(result?.email).toBe('jwt@example.com')
  })

  it('should use session URL when jwt config is not provided', async () => {
    const mockSession = { email: 'url@example.com' }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSession),
    })

    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: 'https://sso.example.com/session',
    }

    const result = await validateSSOSession(config, 'cookie-value')

    expect(result).toEqual(mockSession)
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('fetchSSOSession', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.useRealTimers()
  })

  it('should return session data on success', async () => {
    const mockSession = { email: 'test@example.com', firstName: 'Test' }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSession),
    })

    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: 'https://sso.example.com/session',
    }

    const result = await fetchSSOSession(config, 'abc123')

    expect(result).toEqual(mockSession)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://sso.example.com/session',
      expect.objectContaining({
        method: 'GET',
        headers: {
          cookie: 'session=abc123',
          Accept: 'application/json',
        },
      }),
    )
  })

  it('should extract user object from nested response', async () => {
    const mockResponse = {
      authenticated: true,
      user: { email: 'nested@example.com', firstName: 'Nested' },
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: 'https://sso.example.com/session',
    }

    const result = await fetchSSOSession(config, 'abc123')

    expect(result).toEqual({ email: 'nested@example.com', firstName: 'Nested' })
  })

  it('should return null on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    })

    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: 'https://sso.example.com/session',
    }

    const result = await fetchSSOSession(config, 'invalid')
    expect(result).toBeNull()
  })

  it('should return null on fetch error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
      sessionUrl: 'https://sso.example.com/session',
    }

    const result = await fetchSSOSession(config, 'abc123')
    expect(result).toBeNull()
  })

  it('should return null when sessionUrl is not provided', async () => {
    const config = {
      cookieName: 'session',
      loginUrl: 'https://sso.example.com/login',
      logoutUrl: 'https://sso.example.com/logout',
    }

    const result = await fetchSSOSession(config, 'abc123')
    expect(result).toBeNull()
  })
})
