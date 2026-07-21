import { test, expect } from '@playwright/test';

test('home page loads with h1 slogan visible', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto('/');

  // Verify h1 is visible
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible();
  await expect(h1).not.toBeEmpty();

  expect(consoleErrors).toEqual([]);
});

test('nav renders its links', async ({ page }) => {
  await page.goto('/');

  const expectedLinks = ['Services', 'Projects', 'Q&A', 'Request a quote'];

  for (const linkText of expectedLinks) {
    const link = page.locator(`a, button, [role="link"]`, { hasText: linkText }).first();
    await expect(link).toBeVisible();
  }
});

test('in-page anchor navigation works', async ({ page }) => {
  await page.goto('/');

  // Find and click "Request a quote" link
  const quoteLink = page.locator(`a, button, [role="link"]`, { hasText: 'Request a quote' }).first();
  await quoteLink.click();

  // Check if page scrolled to #quote section or form is visible
  const quoteSection = page.locator('#quote, [id*="quote"]').first();
  await expect(quoteSection).toBeVisible();
});

test('hero video and scroll indicator are present', async ({ page }) => {
  await page.goto('/');

  // Check for video element
  const video = page.locator('video').first();
  await expect(video).toBeVisible();

  // Check for scroll indicator
  const scrollIndicator = page.getByRole('link', { name: 'Scroll down to services' });
  await expect(scrollIndicator).toBeVisible();
});
