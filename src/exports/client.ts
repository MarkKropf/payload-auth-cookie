/**
 * Client-side exports for the Payload Auth Cookie plugin
 * These exports are used in the Payload admin UI and client-side code
 */

export type { AuthPluginConfig, SSOProviderConfig, AuthPlugin } from '../types.js'

export { LoginButton } from '../components/LoginButton.js'
export type { LoginButtonProps } from '../components/LoginButton.js'

export { AuthProvider, useAuth, createAuthClient } from '../components/AuthClient.js'
export type { AuthContextType, AuthProviderProps } from '../components/AuthClient.js'
