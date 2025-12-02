'use client'

import React from 'react'
import { useConfig } from '@payloadcms/ui'

export interface DefaultSSOLoginButtonProps {
  namespace: string
  label?: string
}

export const DefaultSSOLoginButton: React.FC<DefaultSSOLoginButtonProps> = ({
  namespace,
  label = 'Sign in with SSO',
}) => {
  const { config } = useConfig()
  const apiBase = config.routes?.api ?? '/api'
  const href = `${apiBase}/${namespace}/auth/login`

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.location.href = href
  }

  const buttonClasses = [
    'btn',
    'btn--style-primary',
    'btn--icon-style-without-border',
    'btn--size-medium',
  ].join(' ')

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1rem',
        marginBottom: '1rem',
      }}
    >
      <a
        aria-label={label}
        className={buttonClasses}
        href={href}
        onClick={handleClick}
        type="button"
      >
        <span className="btn__content">
          <span className="btn__label">{label}</span>
        </span>
      </a>
    </div>
  )
}

export default DefaultSSOLoginButton
