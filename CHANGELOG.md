# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4] - 2025-12-03

### Fixed

- Patched CVE-2025-55182 - React RSC & Next.js

## [0.0.3] - 2025-12-02

### Added

- **Auto-inject admin UI components**: When `useAdmin: true`, the plugin now automatically injects login and logout components into the admin panel, eliminating the need for manual component configuration
- New `autoInjectAdminUI` config option (defaults to `true`) - set to `false` to provide custom components
- New internal components:
  - `DefaultSSOLoginButton` - Auto-configured SSO login button for admin panel
  - `DefaultSSOLogoutRedirect` - Auto-configured logout redirect component
- New package exports:
  - `payload-auth-cookie/admin/DefaultSSOLoginButton`
  - `payload-auth-cookie/admin/DefaultSSOLogoutRedirect`

### Changed

- Plugin now automatically configures `admin.components.afterLogin` and `admin.components.views.logout` when `useAdmin: true`
- Components dynamically compute API routes using Payload's `useConfig()` hook

### Migration

Users upgrading from 0.0.2 can remove manual admin component configuration:

```diff
// payload.config.ts
export default buildConfig({
  admin: {
    components: {
-     afterLogin: ['@/components/SSOLoginButton'],
-     views: {
-       logout: {
-         Component: '@/components/SSOAdminLogout',
-         path: '/logout',
-       },
-     },
    },
  },
  plugins: [
    authPlugin({
      name: 'admin',
      useAdmin: true,
+     // Login/logout components are now auto-injected!
      usersCollectionSlug: 'adminUsers',
      sso: ssoConfig,
    }),
  ],
})
```

To keep using custom components, set `autoInjectAdminUI: false`.

## [0.0.2] - 2025-12-02

- First github action released package
- Added github registry in addition to npmjs

## [0.0.1] - 2025-12-02

### Added

- Initial release of `payload-auth-cookie`
- Cookie-based SSO authentication for Payload CMS v3
- Support for external SSO session validation via configurable session URL
- JWT verification for SSO cookies with configurable claims mapping
- Support for both admin panel and frontend authentication
- Automatic user creation with configurable sign-up policy (`allowSignUp`)
- Multiple auth instance support for different user types (admin, app users)
- Authentication endpoints:
  - `GET /{name}/auth/login` - Initiates login or validates SSO cookie
  - `GET /{name}/auth/logout` - Clears session and redirects to SSO logout
  - `GET /{name}/auth/session` - Returns current session status
- Client components:
  - `LoginButton` - Customizable SSO login button
  - `AuthProvider` / `useAuth` - React context for auth state management
- Helper functions:
  - `createSSOProviderConfig` - Create SSO config from environment variables
  - `withUsersCollection` - Configure collections for SSO user management
  - `validateSSOSession` - Validate SSO sessions (JWT or URL-based)
  - `verifyJWTSession` - Verify and decode JWT tokens
  - `fetchSSOSession` - Fetch session from external API
  - `parseCookies` - Parse cookies from request headers
- Full TypeScript support with exported types
- Comprehensive test suite (unit tests with Vitest)

### Features

- **Flexible Session Validation**: Choose between JWT verification (local, no API call) or session URL validation (external API call)
- **Nested JWT Claims**: Support for dot-notation field paths (e.g., `user.email`) for JWT claim extraction
- **Custom Callbacks**: `onSuccess` and `onError` hooks for custom authentication logic
- **Cookie Configuration**: Respects Payload's cookie configuration (secure, sameSite, domain)
- **Profile Sync**: Automatically updates user profile fields (firstName, lastName, profilePictureUrl) from SSO session data

### Compatibility

- Payload CMS ^3.64.0
- Node.js ^18.20.2 || >=20.9.0
