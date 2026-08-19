import { test, expect } from '@playwright/test';

test.describe('admin login page', () => {
  test('shows the email-first OTP flow by default', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send code' })).toBeVisible();
    await expect(page.getByLabel('Password')).toHaveCount(0);
  });

  test('developer login toggle swaps to the password form and back', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByRole('button', { name: 'Developer login' }).click();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveCount(0);
    await page.getByRole('button', { name: 'Back to email login' }).click();
    await expect(page.getByLabel('Email')).toBeVisible();
  });
});
