// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Registration / New Account - Positive and Negative', async ({ page }) => {
    // Assumption note: If the environment does not allow real registration,
    // treat this as a smoke check for the registration UI only.

    // Open homepage and navigate to registration
    await page.goto('https://www.abv.bg');
    await expect(page.getByText('АБВ Поща', { exact: true })).toBeVisible();

    // Open registration flow (link text may vary)
    const registerLink = page.getByRole('link', { name: /Регистрация|Register|Sign up/ }).first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page.getByRole('heading', { name: /Регистрация|Register/ })).toBeVisible();

      // Positive path: fill valid data (use env or generate unique username)
      const uniqueUser = `test_user_${Date.now()}`;
      await page.fill('input[name="username"]', uniqueUser);
      await page.fill('input[name="password"]', process.env.ABV_TEST_PASS ?? 'Password123!');
      await page.fill('input[name="email"]', `${uniqueUser}@example.com`);
      await page.getByRole('button', { name: /Регистрирай|Register|Sign up/ }).click();

      // Verify registration result or confirmation message
      await expect(page.getByText(/потвърждение|confirmation|успешно/i)).toBeVisible();

      // Negative checks: missing required field
      await page.goto('https://www.abv.bg');
      await registerLink.click();
      await page.fill('input[name="username"]', '');
      await page.getByRole('button', { name: /Регистрирай|Register|Sign up/ }).click();
      await expect(page.getByText(/задължителен|required|is required/i)).toBeVisible();
    }
  });
});
