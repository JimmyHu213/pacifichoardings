import { test, expect } from '@playwright/test';

test.describe('D1-backed site content', () => {
	test('about page renders the seeded content', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByRole('heading', { name: 'One crew. One engineer. Every hoarding.' })).toBeVisible();
		await expect(page.getByText('AS 4687 certified').first()).toBeVisible();
		await expect(page.getByText('Harbourline Constructions')).toBeVisible();
	});

	test('header renders the seeded company phone number', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByRole('link', { name: '1300 722 477' }).first()).toBeVisible();
	});

	test('footer renders the seeded company info on the home page', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText('Pacific Hoarding Pty Ltd · ABN 96 686 186 934')).toBeVisible();
	});
});
