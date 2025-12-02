import { describe, it, expect, vi } from 'vitest'
import { withUsersCollection } from './withUsersCollection.js'

vi.mock('../collections/createUsersCollection.js', () => ({
  createUsersCollection: () => ({
    slug: 'users',
    fields: [
      { name: 'email', type: 'email' },
      { name: 'firstName', type: 'text' },
    ],
    admin: { useAsTitle: 'email' },
  }),
}))

describe('withUsersCollection', () => {
  it('should merge existing fields with base fields', () => {
    const config = withUsersCollection({
      slug: 'users',
      fields: [{ name: 'customField', type: 'text' }],
      auth: true,
    })

    const fieldNames = config.fields
      .filter((f): f is { name: string } => 'name' in f)
      .map((f) => f.name)

    expect(fieldNames).toContain('customField')
    expect(fieldNames).toContain('email')
    expect(fieldNames).toContain('firstName')
  })

  it('should not duplicate fields that already exist', () => {
    const config = withUsersCollection({
      slug: 'users',
      fields: [{ name: 'email', type: 'email', required: true }],
      auth: true,
    })

    const emailFields = config.fields.filter(
      (f): f is { name: string } => 'name' in f && f.name === 'email',
    )

    expect(emailFields.length).toBe(1)
  })

  it('should preserve incoming auth config', () => {
    const config = withUsersCollection({
      slug: 'users',
      auth: {
        disableLocalStrategy: true,
        useSessions: true,
      },
    })

    expect(config.auth).toEqual({
      disableLocalStrategy: true,
      useSessions: true,
    })
  })

  it('should merge admin config', () => {
    const config = withUsersCollection({
      slug: 'users',
      admin: {
        defaultColumns: ['id', 'email'],
      },
    })

    expect(config.admin).toBeDefined()
    expect(config.admin?.defaultColumns).toEqual(['id', 'email'])
    expect(config.admin?.useAsTitle).toBe('email')
  })
})
