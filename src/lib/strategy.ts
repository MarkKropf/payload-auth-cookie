import type { Payload } from 'payload'
import type { SSOProviderConfig } from '../types.js'
import { parseCookies, validateSSOSession, getEmailFromSession } from './sso-session.js'

export interface CookieAuthStrategyOptions {
  collectionSlug: string
  ssoConfig: SSOProviderConfig
  allowSignUp?: boolean
}

/**
 * Cookie-based authentication strategy for Payload v3
 *
 * This strategy validates the external SSO cookie directly on each request,
 * completely bypassing Payload's built-in token/session system.
 *
 * When allowSignUp is true and a user doesn't exist, it will be created automatically.
 *
 * @param collectionSlug - The slug of the users collection
 * @param ssoConfig - SSO provider configuration for cookie validation
 * @param allowSignUp - Whether to create new users on first login
 */
export function createCookieAuthStrategy(
  collectionSlug: string,
  ssoConfig: SSOProviderConfig,
  allowSignUp?: boolean,
) {
  return {
    name: `sso-cookie-${collectionSlug}`,
    authenticate: async ({ headers, payload }: { headers: Headers; payload: Payload }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Payload's collections object uses dynamic keys
        const collection = (payload.collections as any)[collectionSlug]

        if (!collection || !collection.config.auth) {
          return { user: null }
        }

        const origin = headers.get('Origin')
        if (
          origin &&
          payload.config.csrf &&
          payload.config.csrf.length > 0 &&
          !payload.config.csrf.includes(origin)
        ) {
          return { user: null }
        }

        const cookies = parseCookies(headers)
        const ssoCookie = cookies[ssoConfig.cookieName]

        if (!ssoCookie) {
          return { user: null }
        }

        const session = await validateSSOSession(ssoConfig, ssoCookie)

        if (!session) {
          return { user: null }
        }

        const email = getEmailFromSession(session)

        if (!email) {
          return { user: null }
        }

        const users = await payload.find({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug parameter
          collection: collectionSlug as any,
          where: {
            email: {
              equals: email,
            },
          },
          limit: 1,
        })

        let user = users.docs[0]

        if (user) {
          // Update existing user with SSO data
          const updateData: Record<string, unknown> = {}

          if (session.name && typeof session.name === 'string') {
            updateData.name = session.name
          }
          if (session.firstName && typeof session.firstName === 'string') {
            updateData.firstName = session.firstName
          }
          if (session.lastName && typeof session.lastName === 'string') {
            updateData.lastName = session.lastName
          }
          if (session.profilePictureUrl && typeof session.profilePictureUrl === 'string') {
            updateData.profilePictureUrl = session.profilePictureUrl
          }
          if (session.emailVerified !== undefined) {
            updateData.emailVerified = session.emailVerified
          }
          if (session.lastLoginAt !== undefined) {
            updateData.lastLoginAt = session.lastLoginAt
          }

          if (Object.keys(updateData).length > 0) {
            user = await payload.update({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug from config
              collection: collectionSlug as any,
              id: user.id,
              data: updateData,
            })
          }
        } else {
          if (!allowSignUp) {
            return { user: null }
          }

          const createData: Record<string, unknown> = { email }

          if (session.name && typeof session.name === 'string') {
            createData.name = session.name
          }
          if (session.firstName && typeof session.firstName === 'string') {
            createData.firstName = session.firstName
          }
          if (session.lastName && typeof session.lastName === 'string') {
            createData.lastName = session.lastName
          }
          if (session.profilePictureUrl && typeof session.profilePictureUrl === 'string') {
            createData.profilePictureUrl = session.profilePictureUrl
          }
          if (session.emailVerified !== undefined) {
            createData.emailVerified = session.emailVerified
          }
          if (session.lastLoginAt !== undefined) {
            createData.lastLoginAt = session.lastLoginAt
          }

          user = await payload.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug from config
            collection: collectionSlug as any,
            data: createData,
          })
        }

        return {
          user: {
            ...user,
            _strategy: `sso-cookie-${collectionSlug}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug parameter for user augmentation
            collection: collectionSlug as any,
          },
        }
      } catch {
        return { user: null }
      }
    },
  }
}
