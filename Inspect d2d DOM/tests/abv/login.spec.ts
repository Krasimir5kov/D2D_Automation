// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Login - Happy and Negative Paths', async ({ page }) => {
    // 1. Open Homepage
    await page.goto('https://www.abv.bg');
    await expect(page.getByText('АБВ Поща', { exact: true })).toBeVisible();

    // 2. Open Login Form
    await page.locator('#loginBut').click();
    await expect(page.getByRole('heading', { name: /Вход/ })).toBeVisible();

    // 3. Successful Login
    // NOTE: Credentials must be provided via environment variables: ABV_USER, ABV_PASS
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', process.env.ABV_PASS ?? '');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();
    // Assert a post-login element (avatar, inbox link); selector may need adjustment per UI
    await expect(page.locator('text=Поща').first()).toBeVisible();

    // 4. Logout
    // Attempt to open user menu and click logout; selector may need adjustment
    const userMenu = page.getByRole('button', { name: /Акаунт|Профил|Меню/ }).first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      const logout = page.getByRole('link', { name: /Изход|Logout|Sign out/ }).first();
      if (await logout.isVisible()) {
        await logout.click();
        await expect(page.getByText('АБВ Поща', { exact: true })).toBeVisible();
      }
    }

    // 5. Invalid Password
    await page.locator('#loginBut').click();
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', 'wrong-password');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();
    await expect(page.getByText(/неправилен|грешен|invalid/i)).toBeVisible();

    // 6. Non-existent Username
    await page.fill('input[name="username"]', 'nonexistent_user_12345');
    await page.fill('input[name="password"]', 'doesntmatter');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();
    await expect(page.getByText(/не e намерен|не съществува|not found/i)).toBeVisible();
  });
});
