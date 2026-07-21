import { test, expect } from '@playwright/test';

test.describe('desktop services dropdown', () => {
  test('click opens the dropdown and links reach the service pages', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-desktop .nav-dropdown-trigger').click();

    const panel = page.locator('.nav-desktop .nav-dropdown-panel');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('link')).toHaveCount(6);

    await panel.getByRole('link', { name: 'Class A hoarding' }).click();
    await expect(page).toHaveURL(/\/services\/class-a-hoarding$/);
    await expect(page.locator('h1')).toHaveText(/class a hoarding/i);
  });

  test('hover opens the dropdown and Escape closes it', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('.nav-desktop .nav-dropdown-trigger');
    const panel = page.locator('.nav-desktop .nav-dropdown-panel');

    await trigger.hover();
    await expect(panel).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
  });

  test('keyboard activation toggles the dropdown', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('.nav-desktop .nav-dropdown-trigger');
    const panel = page.locator('.nav-desktop .nav-dropdown-panel');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(panel).toBeHidden();
  });
});

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('hamburger opens the panel and the services accordion expands', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-desktop')).toBeHidden();

    await page.locator('.nav-hamburger').click();
    const panel = page.locator('#mobile-menu-panel');
    await expect(panel).toBeVisible();

    await panel.locator('.nav-dropdown-trigger').click();
    await expect(panel.getByRole('link', { name: 'Temporary fencing' })).toBeVisible();
  });
});

test.describe('service page', () => {
  test('renders scaffold content with quote CTA', async ({ page }) => {
    await page.goto('/services/council-permits');
    await expect(page.locator('h1')).toHaveText(/council permits/i);
    await expect(page.getByRole('link', { name: 'Request a quote' }).last()).toHaveAttribute('href', '/#quote');
  });
});
