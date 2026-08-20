import { test, expect } from '@playwright/test';

test.describe('D1-backed services', () => {
  test('service page renders the seeded content', async ({ page }) => {
    await page.goto('/services/class-a-hoarding');
    await expect(page.getByRole('heading', { name: 'Class A hoarding', exact: true })).toBeVisible();
    await expect(page.getByText('Ground-level hoarding that stands straight and locks up tight.')).toBeVisible();
  });

  test('quote form offers the four service titles plus the fallback', async ({ page }) => {
    await page.goto('/');
    const options = page.locator('#q-type option');
    await expect(options).toHaveCount(5);
    await expect(options.nth(0)).toHaveText('Class A hoarding');
    await expect(options.nth(3)).toHaveText('Council permits');
    await expect(options.nth(4)).toHaveText('Not sure yet — advise me');
  });
});
