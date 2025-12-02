import { describe, it, expect, vi } from 'vitest'
import { handleSSOLogin } from './auth-handler.js'

describe('handleSSOLogin', () => {
  it('should find and return existing user', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    const mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: [mockUser] }),
      update: vi.fn().mockResolvedValue(mockUser),
    }

    const config = {
      name: 'test',
      usersCollectionSlug: 'users',
      sso: {
        cookieName: 'session',
        loginUrl: 'https://sso.example.com/login',
        logoutUrl: 'https://sso.example.com/logout',
        sessionUrl: 'https://sso.example.com/session',
      },
    }

    const session = { email: 'test@example.com' }
    const mockReq = new Request('https://example.com')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await handleSSOLogin(mockPayload as any, config, session, mockReq)

    expect(result.user).toEqual(mockUser)
    expect(mockPayload.find).toHaveBeenCalledWith({
      collection: 'users',
      where: { email: { equals: 'test@example.com' } },
      limit: 1,
    })
  })

  it('should update user with session data', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    const updatedUser = { ...mockUser, firstName: 'John', lastName: 'Doe' }
    const mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: [mockUser] }),
      update: vi.fn().mockResolvedValue(updatedUser),
    }

    const config = {
      name: 'test',
      usersCollectionSlug: 'users',
      sso: {
        cookieName: 'session',
        loginUrl: 'https://sso.example.com/login',
        logoutUrl: 'https://sso.example.com/logout',
        sessionUrl: 'https://sso.example.com/session',
      },
    }

    const session = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    }
    const mockReq = new Request('https://example.com')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await handleSSOLogin(mockPayload as any, config, session, mockReq)

    expect(result.user).toEqual(updatedUser)
    expect(mockPayload.update).toHaveBeenCalledWith({
      collection: 'users',
      id: '123',
      data: { firstName: 'John', lastName: 'Doe' },
    })
  })

  it('should create new user when allowSignUp is true', async () => {
    const newUser = { id: '456', email: 'new@example.com', firstName: 'New' }
    const mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi.fn().mockResolvedValue(newUser),
    }

    const config = {
      name: 'test',
      usersCollectionSlug: 'users',
      allowSignUp: true,
      sso: {
        cookieName: 'session',
        loginUrl: 'https://sso.example.com/login',
        logoutUrl: 'https://sso.example.com/logout',
        sessionUrl: 'https://sso.example.com/session',
      },
    }

    const session = { email: 'new@example.com', firstName: 'New' }
    const mockReq = new Request('https://example.com')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await handleSSOLogin(mockPayload as any, config, session, mockReq)

    expect(result.user).toEqual(newUser)
    expect(mockPayload.create).toHaveBeenCalledWith({
      collection: 'users',
      data: { email: 'new@example.com', firstName: 'New' },
    })
  })

  it('should throw when user not found and allowSignUp is false', async () => {
    const mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: [] }),
    }

    const config = {
      name: 'test',
      usersCollectionSlug: 'users',
      allowSignUp: false,
      sso: {
        cookieName: 'session',
        loginUrl: 'https://sso.example.com/login',
        logoutUrl: 'https://sso.example.com/logout',
        sessionUrl: 'https://sso.example.com/session',
      },
    }

    const session = { email: 'unknown@example.com' }
    const mockReq = new Request('https://example.com')

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleSSOLogin(mockPayload as any, config, session, mockReq),
    ).rejects.toThrow('Sign-up is not allowed')
  })

  it('should throw when session has no email', async () => {
    const mockPayload = {}

    const config = {
      name: 'test',
      usersCollectionSlug: 'users',
      sso: {
        cookieName: 'session',
        loginUrl: 'https://sso.example.com/login',
        logoutUrl: 'https://sso.example.com/logout',
        sessionUrl: 'https://sso.example.com/session',
      },
    }

    const session = { name: 'No Email' }
    const mockReq = new Request('https://example.com')

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleSSOLogin(mockPayload as any, config, session as any, mockReq),
    ).rejects.toThrow('SSO session missing email')
  })

  it('should call onSuccess callback', async () => {
    const mockUser = { id: '123', email: 'test@example.com' }
    const mockPayload = {
      find: vi.fn().mockResolvedValue({ docs: [mockUser] }),
    }

    const onSuccess = vi.fn()

    const config = {
      name: 'test',
      usersCollectionSlug: 'users',
      onSuccess,
      sso: {
        cookieName: 'session',
        loginUrl: 'https://sso.example.com/login',
        logoutUrl: 'https://sso.example.com/logout',
        sessionUrl: 'https://sso.example.com/session',
      },
    }

    const session = { email: 'test@example.com' }
    const mockReq = new Request('https://example.com')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await handleSSOLogin(mockPayload as any, config, session, mockReq)

    expect(onSuccess).toHaveBeenCalledWith({
      user: mockUser,
      session,
      req: mockReq,
    })
  })

  it('should call onError callback on failure', async () => {
    const mockPayload = {
      find: vi.fn().mockRejectedValue(new Error('Database error')),
    }

    const onError = vi.fn()

    const config = {
      name: 'test',
      usersCollectionSlug: 'users',
      onError,
      sso: {
        cookieName: 'session',
        loginUrl: 'https://sso.example.com/login',
        logoutUrl: 'https://sso.example.com/logout',
        sessionUrl: 'https://sso.example.com/session',
      },
    }

    const session = { email: 'test@example.com' }
    const mockReq = new Request('https://example.com')

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleSSOLogin(mockPayload as any, config, session, mockReq),
    ).rejects.toThrow('Database error')

    expect(onError).toHaveBeenCalledWith({
      error: expect.any(Error),
      req: mockReq,
    })
  })
})
