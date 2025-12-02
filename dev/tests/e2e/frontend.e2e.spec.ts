import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test('can access admin login page with SSO button', async ({ page }) => {
    await page.goto('http://127.0.0.1:3000/admin')

    await expect(page).toHaveTitle(/Payload/)

    const ssoButton = page.getByRole('link', { name: /SSO/i })
    await expect(ssoButton).toBeVisible({ timeout: 15000 })
  })
})
