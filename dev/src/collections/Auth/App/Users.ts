import { authenticated } from '@/access/authenticated'
import type { CollectionConfig } from 'payload'
import { withUsersCollection } from 'payload-auth-cookie/collection'

export const AppUsers: CollectionConfig = withUsersCollection({
  slug: 'appUsers',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['id', 'name', 'email'],
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
    useSessions: true,
    cookies: {
      secure: true,
      sameSite: true,
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
})
