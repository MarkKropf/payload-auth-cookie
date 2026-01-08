# Changelog

All notable changes to this project will be documented in this file.

## [0.0.12] - 2026-01-08

### Fixed

- **Multi-collection authentication**: Session endpoints now correctly return users from their own collection instead of the first-matched collection. Previously, when multiple `authPlugin` instances were configured (e.g., `adminUsers` + `appUsers`), calling `/api/app/auth/session` could incorrectly return users from `adminUsers`.

- **Field mappings for non-primary collections**: SSO data (name, firstName, lastName, profilePictureUrl, emailVerified, lastLoginAt) is now properly synced to all collection user records via their respective session endpoints, not just the first collection's users.

### Changed

- Authentication strategy names are now unique per collection (`sso-cookie-${collectionSlug}`) instead of the generic `sso-cookie`. This improves debugging and prevents strategy conflicts in multi-collection setups.

- Updated minimum Node.js requirement to `>=22.0.0` for compatibility with latest dependencies.

## [0.0.11] - Previous Release

- Added `fieldMappings` to `SSOProviderConfig` for mapping SSO response fields to user collection fields.

## [0.0.10] and earlier

- Initial releases with core SSO cookie authentication functionality.
