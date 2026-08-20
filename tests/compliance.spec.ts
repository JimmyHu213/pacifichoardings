import { test, expect } from '@playwright/test';

test.describe('D1-backed compliance page', () => {
  test('renders the seeded content and shared tags', async ({ page }) => {
    await page.goto('/compliance');
    await expect(page.getByRole('heading', { name: 'Compliant is the minimum' })).toBeVisible();
    await expect(page.getByText('section 138 of the Roads Act 1993')).toBeVisible();
    await expect(page.getByText('$20M public liability').first()).toBeVisible();
  });
});
