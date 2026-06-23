// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Logout and Session Handling', async ({ page }) => {
    // Login
    await page.goto('https://www.abv.bg');
    await page.locator('#loginBut').click();
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', process.env.ABV_PASS ?? '');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();

    // Logout
    const userMenu = page.getByRole('button', { name: /Акаунт|Профил|Меню/ }).first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      const logout = page.getByRole('link', { name: /Изход|Logout|Sign out/ }).first();
      if (await logout.isVisible()) {
        await logout.click();
        await expect(page.getByText('АБВ Поща', { exact: true })).toBeVisible();

        // Try to go back to inbox (browser back) - ensure session is protected
        await page.goBack();
        await expect(page.getByRole('link', { name: /Входящи|Inbox/ })).not.toBeVisible();
      }
    }
  });
});
