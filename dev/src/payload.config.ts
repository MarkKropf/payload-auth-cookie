import { postgresAdapter } from '@payloadcms/db-postgres'

import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

import { authPlugin, createSSOProviderConfig } from 'payload-auth-cookie'
import { AdminUsers } from './collections/Auth/Admin/Users'
import { AppUsers } from './collections/Auth/App/Users'

const ssoConfig = createSSOProviderConfig({
  cookieName: process.env.SSO_COOKIE_NAME || 'supaku_session',
  loginUrl: process.env.SSO_LOGIN_URL || 'http://localhost:3000/login',
  logoutUrl: process.env.SSO_LOGOUT_URL || 'http://localhost:3000/logout',
  ...(process.env.SSO_JWT_SECRET
    ? {
        jwt: {
          secret: process.env.SSO_JWT_SECRET,
        },
      }
    : {
        sessionUrl: process.env.SSO_SESSION_URL || 'http://127.0.0.1:3000/api/session/me',
      }),
  fieldMappings: {
    nameField: 'name',
    profilePictureUrlField: 'profileImageUrl',
  },
})

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: false,
  }),
  collections: [AdminUsers, AppUsers, Pages, Posts, Media, Categories],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    authPlugin({
      name: 'admin',
      useAdmin: true,
      usersCollectionSlug: AdminUsers.slug,
      successRedirectPath: '/admin',
      sso: ssoConfig,
    }),
    authPlugin({
      name: 'app',
      allowSignUp: true,
      usersCollectionSlug: AppUsers.slug,
      sso: ssoConfig,
    }),
    ...plugins,
  ],
  secret: process.env.PAYLOAD_SECRET as string,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true

        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
