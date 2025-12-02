import type { Config } from 'payload'
import type { AuthPluginConfig } from './types.js'
import { createUsersCollection } from './collections/createUsersCollection.js'
import { withUsersCollection } from './collection/withUsersCollection.js'
import { createAuthEndpoints } from './endpoints/index.js'
import { createCookieAuthStrategy } from './lib/strategy.js'
import { validateSSOConfig } from './lib/sso-session.js'
import { setAdminAuthCollectionSlug } from './utilities/getAdminAuthCollection.js'

const DEFAULT_LOGIN_COMPONENT_PATH = 'payload-auth-cookie/admin/DefaultSSOLoginButton'
const DEFAULT_LOGOUT_COMPONENT_PATH = 'payload-auth-cookie/admin/DefaultSSOLogoutRedirect'

/**
 * Payload authentication plugin for external SSO cookie-based authentication
 *
 * This plugin integrates external SSO cookie authentication with Payload CMS,
 * allowing you to configure one or multiple user collections with cookie-based authentication.
 *
 * @param config - Plugin configuration
 * @returns A function that extends the Payload config
 *
 * @example
 * ```ts
 * import { authPlugin } from 'payload-auth-cookie'
 *
 * export default buildConfig({
 *   plugins: [
 *     authPlugin({
 *       name: 'admin',
 *       useAdmin: true,
 *       usersCollectionSlug: 'adminUsers',
 *       sso: {
 *         cookieName: process.env.SSO_COOKIE_NAME,
 *         loginUrl: process.env.SSO_LOGIN_URL,
 *         logoutUrl: process.env.SSO_LOGOUT_URL,
 *         sessionUrl: process.env.SSO_SESSION_URL,
 *       },
 *     }),
 *   ],
 * })
 * ```
 */
export function authPlugin(pluginConfig: AuthPluginConfig) {
  return (incomingConfig: Config): Config => {
    validateSSOConfig(pluginConfig.sso)

    const config: AuthPluginConfig = {
      useAdmin: false,
      allowSignUp: false,
      successRedirectPath: '/',
      errorRedirectPath: '/auth/error',
      ...pluginConfig,
    }

    const existingUserCollection = incomingConfig.collections?.find(
      (c) => c.slug === config.usersCollectionSlug,
    )

    const collections = [...(incomingConfig.collections || [])]

    let adminUserSlug = incomingConfig.admin?.user || 'users'
    if (config.useAdmin) {
      adminUserSlug = config.usersCollectionSlug
    }

    setAdminAuthCollectionSlug(adminUserSlug)

    const cookieAuthStrategy = createCookieAuthStrategy(config.usersCollectionSlug, config.sso)

    if (!existingUserCollection) {
      const userCollection = createUsersCollection(config.usersCollectionSlug, config.useAdmin)

      if (userCollection.auth && typeof userCollection.auth === 'object') {
        userCollection.auth.strategies = [
          ...(userCollection.auth.strategies || []),
          cookieAuthStrategy,
        ]
      }

      collections.push(userCollection)
    } else {
      const index = collections.findIndex((c) => c.slug === config.usersCollectionSlug)
      if (index !== -1) {
        const existingCollection = withUsersCollection(collections[index])

        let authConfig = existingCollection.auth
        if (authConfig !== false) {
          if (authConfig === true || authConfig === undefined) {
            authConfig = {
              strategies: [cookieAuthStrategy],
            }
          } else if (typeof authConfig === 'object') {
            authConfig = {
              ...authConfig,
              strategies: [...(authConfig.strategies || []), cookieAuthStrategy],
            }
          }
        }

        collections[index] = {
          ...existingCollection,
          auth: authConfig,
        }
      }
    }

    const apiPrefix = incomingConfig.routes?.api || '/api'

    const endpoints = createAuthEndpoints(config, apiPrefix)

    const allEndpoints = [...(incomingConfig.endpoints || []), ...endpoints]

    let adminConfig = incomingConfig.admin

    if (config.useAdmin) {
      adminConfig = {
        ...incomingConfig.admin,
        user: config.usersCollectionSlug,
      }

      if (config.autoInjectAdminUI !== false) {
        const loginPath = DEFAULT_LOGIN_COMPONENT_PATH
        const logoutPath = DEFAULT_LOGOUT_COMPONENT_PATH

        adminConfig.components = adminConfig.components ?? {}

        const existingAfterLogin = adminConfig.components.afterLogin ?? []
        const hasOurLogin = existingAfterLogin.some((entry: unknown) => {
          const p = typeof entry === 'string' ? entry : (entry as { path?: string })?.path
          return p === loginPath
        })

        if (!hasOurLogin) {
          adminConfig.components.afterLogin = [
            ...existingAfterLogin,
            {
              path: loginPath,
              clientProps: {
                namespace: config.name,
              },
            },
          ]
        }

        adminConfig.components.views = adminConfig.components.views ?? {}
        if (!adminConfig.components.views.logout) {
          adminConfig.components.views.logout = {
            Component: {
              path: logoutPath,
              clientProps: {
                namespace: config.name,
              },
            },
            path: '/logout',
          }
        }
      }
    }

    return {
      ...incomingConfig,
      collections,
      endpoints: allEndpoints,
      admin: adminConfig,
    }
  }
}
