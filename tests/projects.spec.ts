import { test, expect } from '@playwright/test';

test.describe('project detail pages', () => {
  test('a project card links to its detail page', async ({ page }) => {
    await page.goto('/projects');
    const firstCard = page.locator('.ph-proj').first();
    // Both the media figure and the title link to the detail page — take the first.
    await firstCard.getByRole('link', { name: /commercial tower/i }).first().click();
    await expect(page).toHaveURL(/\/projects\/commercial-tower$/);
    await expect(page.locator('h1')).toHaveText(/commercial tower/i);
  });

  test('detail page renders description and gallery photo', async ({ page }) => {
    await page.goto('/projects/commercial-tower');
    await expect(page.getByText(/140-linear-metre Class B gantry/i)).toBeVisible();
    await expect(page.locator('img[src*="/media/projects/"]').first()).toBeVisible();
  });

  test('unknown project slug returns 404', async ({ page }) => {
    const response = await page.goto('/projects/not-a-real-project');
    expect(response?.status()).toBe(404);
  });
});
