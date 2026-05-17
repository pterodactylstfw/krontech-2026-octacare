import { expect, test } from '@playwright/test';

test.describe('Smoke', () => {
  test('redirects protected dashboard route to login for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/auth\/login(?:\?.*)?$/);
    await expect(page.locator('.spinner-ring')).toBeVisible();
  });
});
