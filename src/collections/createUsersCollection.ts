import type { CollectionConfig } from 'payload'

/**
 * Creates a users collection with SSO cookie authentication fields
 */
export function createUsersCollection(
  slug: string,
  isAdmin: boolean = false,
): CollectionConfig {
  return {
    slug,
    admin: {
      useAsTitle: 'email',
    },
    auth: isAdmin
      ? {
          tokenExpiration: 7200,
          verify: false,
          maxLoginAttempts: 5,
          lockTime: 600000,
        }
      : false,
    fields: [
      {
        name: 'email',
        type: 'email',
        required: true,
        unique: true,
      },
      {
        name: 'firstName',
        type: 'text',
      },
      {
        name: 'lastName',
        type: 'text',
      },
      {
        name: 'profilePictureUrl',
        type: 'text',
      },
      {
        name: 'emailVerified',
        type: 'checkbox',
        defaultValue: false,
        admin: {
          description: 'Whether the email has been verified by the SSO provider',
        },
      },
      {
        name: 'lastLoginAt',
        type: 'date',
        admin: {
          description: 'Last login timestamp from the SSO provider',
          date: {
            pickerAppearance: 'dayAndTime',
          },
        },
      },
    ],
  }
}
