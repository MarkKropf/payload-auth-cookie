# payload-auth-cookie

A Payload CMS authentication plugin for external SSO cookie-based authentication.

This plugin allows you to authenticate users based on cookies set by an external SSO system. It validates sessions via a configurable session endpoint and maps users to Payload CMS collections.

## Features

- 🍪 Cookie-based authentication from external SSO systems
- 🔑 JWT verification with configurable secret (no external API call needed)
- 🔐 Support for both admin panel and frontend authentication
- 👤 Automatic user creation with configurable sign-up policy
- 🔄 Session validation via external API or JWT verification
- 📦 TypeScript support with full type definitions

## Installation

```bash
npm install payload-auth-cookie
# or
pnpm add payload-auth-cookie
# or
yarn add payload-auth-cookie
```

## Quick Start

### 1. Configure the Plugin

```typescript
// payload.config.ts
import { buildConfig } from 'payload'
import { authPlugin } from 'payload-auth-cookie'

export default buildConfig({
  plugins: [
    authPlugin({
      name: 'admin',
      useAdmin: true,
      usersCollectionSlug: 'adminUsers',
      successRedirectPath: '/admin',
      sso: {
        cookieName: process.env.SSO_COOKIE_NAME!,
        loginUrl: process.env.SSO_LOGIN_URL!,
        logoutUrl: process.env.SSO_LOGOUT_URL!,
        sessionUrl: process.env.SSO_SESSION_URL!,
      },
    }),
  ],
})
```

### 2. Create a Users Collection

```typescript
// collections/Users.ts
import { withUsersCollection } from 'payload-auth-cookie/collection'

export const AdminUsers = withUsersCollection({
  slug: 'adminUsers',
  auth: {
    disableLocalStrategy: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
  ],
})
```

### 3. Add Login Button to Admin Panel

```typescript
// components/SSOLoginButton.tsx
'use client'

import { LoginButton } from 'payload-auth-cookie/client'

export default function SSOLoginButton() {
  return <LoginButton href="/api/admin/auth/login" label="Sign in with SSO" />
}
```

```typescript
// payload.config.ts
export default buildConfig({
  admin: {
    components: {
      afterLogin: ['@/components/SSOLoginButton'],
    },
  },
  // ...
})
```

## Configuration

### Plugin Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `name` | `string` | ✅ | - | Unique name for this auth configuration (used in endpoint paths) |
| `usersCollectionSlug` | `string` | ✅ | - | Slug of the users collection to authenticate against |
| `sso` | `SSOProviderConfig` | ✅ | - | SSO provider configuration |
| `useAdmin` | `boolean` | ❌ | `false` | Use this configuration for admin panel authentication |
| `allowSignUp` | `boolean` | ❌ | `false` | Allow creating new users on first login |
| `successRedirectPath` | `string` | ❌ | `'/'` | Path to redirect after successful authentication |
| `errorRedirectPath` | `string` | ❌ | `'/auth/error'` | Path to redirect on authentication error |
| `onSuccess` | `function` | ❌ | - | Callback after successful authentication |
| `onError` | `function` | ❌ | - | Callback on authentication error |

### SSO Provider Configuration

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `cookieName` | `string` | ✅ | - | Name of the cookie set by your SSO system |
| `loginUrl` | `string` | ✅ | - | URL to redirect for SSO login |
| `logoutUrl` | `string` | ✅ | - | URL to redirect for SSO logout |
| `sessionUrl` | `string` | ⚠️ | - | URL to validate session (required if `jwt` not provided) |
| `jwt` | `JWTVerificationConfig` | ⚠️ | - | JWT verification config (required if `sessionUrl` not provided) |
| `timeoutMs` | `number` | ❌ | `5000` | Timeout for session validation requests |

### JWT Verification Configuration

When your SSO cookie contains a JWT, you can verify it locally without calling an external session endpoint:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `secret` | `string` | ✅ | - | Secret key for verifying JWT signatures |
| `algorithm` | `string` | ❌ | `'HS256'` | JWT algorithm (`HS256`, `HS384`, `HS512`) |
| `issuer` | `string` | ❌ | - | Expected issuer (iss claim) |
| `audience` | `string` | ❌ | - | Expected audience (aud claim) |
| `emailField` | `string` | ❌ | `'email'` | Field path to extract email (supports dot notation) |
| `firstNameField` | `string` | ❌ | `'firstName'` | Field path to extract first name |
| `lastNameField` | `string` | ❌ | `'lastName'` | Field path to extract last name |
| `profilePictureUrlField` | `string` | ❌ | `'profilePictureUrl'` | Field path to extract profile picture URL |

#### JWT Configuration Example

```typescript
authPlugin({
  name: 'admin',
  useAdmin: true,
  usersCollectionSlug: 'adminUsers',
  sso: {
    cookieName: 'sso_token',
    loginUrl: 'https://sso.example.com/login',
    logoutUrl: 'https://sso.example.com/logout',
    jwt: {
      secret: process.env.SSO_JWT_SECRET!,
      algorithm: 'HS256',
      issuer: 'https://sso.example.com',
      emailField: 'user.email',  // For nested JWT payloads
    },
  },
})
```

## Authentication Flow

### Admin Login Flow

1. User navigates to `/admin`
2. If not authenticated, clicks "Sign in with SSO" button
3. Plugin redirects to `loginUrl` with `returnUrl` parameter
4. User authenticates with external SSO
5. SSO system sets a cookie (e.g., `supaku_session`)
6. User is redirected back to `/api/admin/auth/login`
7. Plugin validates cookie via `sessionUrl` or JWT verification
8. Plugin finds/creates user and sets Payload session cookie
9. User is redirected to `/admin`

### Frontend Login Flow

1. User navigates to `/auth/login` (or custom login page)
2. App redirects to `/api/app/auth/login`
3. If no SSO cookie, redirects to `loginUrl`
4. After SSO authentication, user returns with cookie
5. Plugin validates and creates session
6. User is redirected to success path

## Session Validation Methods

### Method 1: Session URL (API-based)

Your SSO session endpoint (`sessionUrl`) should:

1. Accept the SSO cookie in the request
2. Return JSON with at least an `email` field
3. Return 200 OK for valid sessions
4. Return non-2xx for invalid/expired sessions

#### Expected Response Format

The plugin supports multiple response formats:

**Direct user data:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profilePictureUrl": "https://example.com/avatar.jpg"
}
```

**Nested user object (automatically extracted):**
```json
{
  "authenticated": true,
  "user": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "profilePictureUrl": "https://example.com/avatar.jpg"
  }
}
```

### Method 2: JWT Verification (Local)

If your SSO cookie is a JWT, configure `jwt` instead of `sessionUrl`:

```typescript
sso: {
  cookieName: 'sso_token',
  loginUrl: 'https://sso.example.com/login',
  logoutUrl: 'https://sso.example.com/logout',
  jwt: {
    secret: process.env.SSO_JWT_SECRET!,
  },
}
```

The JWT payload should contain at least an `email` field (configurable via `emailField`).

## Multiple Auth Instances

You can configure multiple auth instances for different user types:

```typescript
plugins: [
  authPlugin({
    name: 'admin',
    useAdmin: true,
    usersCollectionSlug: 'adminUsers',
    successRedirectPath: '/admin',
    sso: adminSSOConfig,
  }),
  authPlugin({
    name: 'app',
    allowSignUp: true,
    usersCollectionSlug: 'appUsers',
    successRedirectPath: '/',
    sso: appSSOConfig,
  }),
]
```

## API Endpoints

The plugin creates the following endpoints (prefixed with your configured `name`):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/{name}/auth/login` | GET | Initiates login or validates SSO cookie |
| `/api/{name}/auth/logout` | GET | Clears session and redirects to SSO logout |
| `/api/{name}/auth/session` | GET | Returns current session status |

## Helper Functions

### Server-Side

```typescript
import {
  validateSSOSession,
  verifyJWTSession,
  fetchSSOSession,
  getEmailFromSession,
  parseCookies,
  generateUserToken,
} from 'payload-auth-cookie'
```

### Client-Side

```typescript
import { LoginButton, AuthProvider, useAuth } from 'payload-auth-cookie/client'
```

## Environment Variables

```env
# Common
SSO_COOKIE_NAME=supaku_session
SSO_LOGIN_URL=https://sso.example.com/login
SSO_LOGOUT_URL=https://sso.example.com/logout

# For Session URL validation
SSO_SESSION_URL=https://sso.example.com/api/session

# For JWT verification (alternative to SESSION_URL)
SSO_JWT_SECRET=your-jwt-signing-secret
```

## License

MIT
