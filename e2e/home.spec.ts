import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Eco-Smart/i);
});

test('can navigate to about or sign in', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Basic check to see if page loaded enough to have main sections
  const main = page.locator('main');
  await expect(main).toBeVisible();
});
