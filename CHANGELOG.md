# Changelog

All notable changes to this project will be documented in this file.

## [0.0.12] - 2026-01-08

### Fixed

- **Multi-collection authentication**: Session endpoints now correctly return users from their own collection instead of the first-matched collection. Previously, when multiple `authPlugin` instances were configured (e.g., `adminUsers` + `appUsers`), calling `/api/app/auth/session` could incorrectly return users from `adminUsers`.

- **Field mappings for non-primary collections**: SSO data (name, firstName, lastName, profilePictureUrl, emailVerified, lastLoginAt) is now properly synced to all collection user records via their respective session endpoints, not just the first collection's users.

### Changed

- Authentication strategy names are now unique per collection (`sso-cookie-${collectionSlug}`) instead of the generic `sso-cookie`. This improves debugging and prevents strategy conflicts in multi-collection setups.

- Updated minimum Node.js requirement to `>=22.0.0` for compatibility with latest dependencies.

## [0.0.11] - 2025-12-05

### Added

- Added `fieldMappings` to `SSOProviderConfig` for mapping SSO response fields to user collection fields.

## [0.0.10] - 2025-12-05

### Fixed

- Fixed `/api/users/me` endpoint to only return user info for admin collections. Non-admin users now correctly receive a null user response.

## [0.0.9] - 2025-12-05

### Fixed

- Fixed auth loop for new users when `allowSignUp: true`. Users are now correctly created and authenticated on first login.

## [0.0.8] - 2025-12-05

### Fixed

- Resolved Payload admin bar issue causing errors on page load.

## [0.0.7] - 2025-12-05

### Added

- Support for the PayloadCMS AdminBar. Added `/api/users/me` endpoint for compatibility with Payload's admin bar which expects this endpoint to exist.

## [0.0.6] - 2025-12-05

### Fixed

- Fixed `emailVerified` and `lastLoginAt` fields not updating on subsequent logins.

## [0.0.5] - 2025-12-05

### Changed

- Internal improvements and bug fixes.

## [0.0.4] - 2025-12-05

### Added

- Added `emailVerified` status field support.
- Added `lastLoginAt` datetime field support.

## [0.0.3] - 2025-12-02

### Added

- Plugin now provides login/logout buttons with minimal required configuration.

### Security

- Patched CVE-2025-55182 (React RSC & Next.js vulnerability).

## [0.0.2] - 2025-12-02

### Added

- GitHub Actions release workflow.

## [0.0.1] - 2025-12-02

### Added

- Initial release with core SSO cookie authentication functionality.
- Cookie-based authentication from external SSO systems.
- JWT verification with configurable secret.
- Support for both admin panel and frontend authentication.
- Automatic user creation with configurable sign-up policy.
- Session validation via external API or JWT verification.
- TypeScript support with full type definitions.
