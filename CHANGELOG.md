# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

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
