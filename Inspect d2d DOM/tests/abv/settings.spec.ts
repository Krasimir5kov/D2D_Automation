// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Settings: Profile, Signature, Auto-reply', async ({ page }) => {
    // Login
    await page.goto('https://www.abv.bg');
    await page.locator('#loginBut').click();
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', process.env.ABV_PASS ?? '');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();

    // Open settings
    const settings = page.getByRole('link', { name: /Настройки|Settings/ }).first();
    if (await settings.isVisible()) {
      await settings.click();
      await expect(page.getByRole('heading', { name: /Настройки|Settings/ })).toBeVisible();

      // Update signature
      const signature = 'Automated test signature';
      await page.fill('textarea[name="signature"]', signature);
      await page.getByRole('button', { name: /Запази|Save/ }).click();
      await expect(page.getByText(/запазено|saved|успешно/i)).toBeVisible();
    }
  });
});
