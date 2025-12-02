'use client'

import React from 'react'
import { LoginButton } from 'payload-auth-cookie/client'

const SSOLoginButton = () => {
  return <LoginButton href="/api/admin/auth/login" label="Sign in with SSO" />
}

export default SSOLoginButton
