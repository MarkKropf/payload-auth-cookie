import type { Payload } from 'payload'
import type { AuthPluginConfig } from '../types.js'
import type { SSOSessionData } from './sso-session.js'
import { getEmailFromSession } from './sso-session.js'

/**
 * Handle SSO login and create/update user in Payload
 *
 * This function takes the validated SSO session data and either:
 * 1. Finds an existing user by email and updates their profile
 * 2. Creates a new user if allowSignUp is enabled
 * 3. Throws an error if user doesn't exist and sign-up is disabled
 */
export async function handleSSOLogin(
  payload: Payload,
  config: AuthPluginConfig,
  session: SSOSessionData,
  req: Request,
): Promise<{
  user: Record<string, unknown> & { id: string | number }
}> {
  try {
    const email = getEmailFromSession(session)
    if (!email) {
      throw new Error('SSO session missing email')
    }

    const existingUsers = await payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug from config
      collection: config.usersCollectionSlug as any,
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    let user: Record<string, unknown> & { id: string | number }

    if (existingUsers.docs.length > 0) {
      const existing = existingUsers.docs[0]
      const updateData: Record<string, unknown> = {}

      if (session.firstName && typeof session.firstName === 'string') {
        updateData.firstName = session.firstName
      }
      if (session.lastName && typeof session.lastName === 'string') {
        updateData.lastName = session.lastName
      }
      if (session.profilePictureUrl && typeof session.profilePictureUrl === 'string') {
        updateData.profilePictureUrl = session.profilePictureUrl
      }

      if (Object.keys(updateData).length > 0) {
        user = (await payload.update({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug from config
          collection: config.usersCollectionSlug as any,
          id: existing.id,
          data: updateData,
        })) as Record<string, unknown> & { id: string | number }
      } else {
        user = existing as Record<string, unknown> & { id: string | number }
      }
    } else {
      if (config.allowSignUp === false) {
        throw new Error('Sign-up is not allowed')
      }

      const createData: Record<string, unknown> = { email }

      if (session.firstName && typeof session.firstName === 'string') {
        createData.firstName = session.firstName
      }
      if (session.lastName && typeof session.lastName === 'string') {
        createData.lastName = session.lastName
      }
      if (session.profilePictureUrl && typeof session.profilePictureUrl === 'string') {
        createData.profilePictureUrl = session.profilePictureUrl
      }

      user = (await payload.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic collection slug from config
        collection: config.usersCollectionSlug as any,
        data: createData,
      })) as Record<string, unknown> & { id: string | number }
    }

    if (config.onSuccess) {
      await config.onSuccess({
        user,
        session,
        req,
      })
    }

    return { user }
  } catch (error) {
    if (config.onError) {
      await config.onError({
        error: error as Error,
        req,
      })
    }
    throw error
  }
}
