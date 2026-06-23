// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Password Recovery / Forgot Password', async ({ page }) => {
    // Open homepage
    await page.goto('https://www.abv.bg');

    // Open login and click 'Forgot password' link
    await page.locator('#loginBut').click();
    const forgot = page.getByRole('link', { name: /Забравена парола|Forgot password/ }).first();
    if (await forgot.isVisible()) {
      await forgot.click();
      await expect(page.getByRole('heading', { name: /Възстановяване|Recovery|Password/ })).toBeVisible();

      // Start recovery with a valid username
      await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
      await page.getByRole('button', { name: /Изпрати|Send|Continue/ }).click();
      await expect(page.getByText(/изпратен|sent|изпратено/i)).toBeVisible();

      // Attempt with non-existent email
      await page.fill('input[name="username"]', 'no_such_user_12345');
      await page.getByRole('button', { name: /Изпрати|Send|Continue/ }).click();
      await expect(page.getByText(/не съществува|no account|не е намерен/i)).toBeVisible();
    }
  });
});
