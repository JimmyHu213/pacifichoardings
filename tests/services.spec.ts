import { test, expect } from '@playwright/test';

test.describe('D1-backed services', () => {
  test('service page renders the seeded content', async ({ page }) => {
    await page.goto('/services/class-a-hoarding');
    await expect(page.getByRole('heading', { name: 'Class A hoarding', exact: true })).toBeVisible();
    await expect(page.getByText('Ground-level hoarding that stands straight and locks up tight.')).toBeVisible();
  });

  test('quote form offers the live service titles plus the fallback', async ({ page }) => {
    await page.goto('/');
    const options = page.locator('#q-type option');
    await expect(options).toHaveCount(4);
    await expect(options.nth(0)).toHaveText('Class A hoarding');
    await expect(options.nth(2)).toHaveText('Design & certification');
    await expect(options.nth(3)).toHaveText('Not sure yet — advise me');
  });

  test('a retired service slug 404s', async ({ page }) => {
    const response = await page.goto('/services/council-permits');
    expect(response?.status()).toBe(404);
  });

  test('services render in sort order across nav and quote form', async ({ page }) => {
    await page.goto('/');
    const options = page.locator('#q-type option');
    await expect(options.nth(0)).toHaveText('Class A hoarding');
    await expect(options.nth(1)).toHaveText('Class B hoarding');
    await expect(options.nth(2)).toHaveText('Design & certification');
  });
});
