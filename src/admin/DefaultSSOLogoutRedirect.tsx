'use client'

import React, { useEffect } from 'react'
import { useConfig } from '@payloadcms/ui'

export interface DefaultSSOLogoutRedirectProps {
  namespace: string
}

export const DefaultSSOLogoutRedirect: React.FC<DefaultSSOLogoutRedirectProps> = ({
  namespace,
}) => {
  const { config } = useConfig()
  const apiBase = config.routes?.api ?? '/api'
  const logoutUrl = `${apiBase}/${namespace}/auth/logout`

  useEffect(() => {
    window.location.href = logoutUrl
  }, [logoutUrl])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1rem',
      }}
    >
      Logging out...
    </div>
  )
}

export default DefaultSSOLogoutRedirect
