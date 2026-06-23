// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Search and Filters', async ({ page }) => {
    // Login
    await page.goto('https://www.abv.bg');
    await page.locator('#loginBut').click();
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', process.env.ABV_PASS ?? '');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();

    // Use search input to find messages by subject
    const search = page.getByRole('searchbox').first();
    if (await search.isVisible()) {
      await search.fill('E2E Test');
      await search.press('Enter');
      await expect(page.getByText(/E2E Test/)).toBeVisible();
    }

    // Filter for attachments
    const attachFilter = page.getByRole('button', { name: /Прикачени|Attachments/ }).first();
    if (await attachFilter.isVisible()) {
      await attachFilter.click();
      await expect(page.locator('article').filter({ hasText: /attachment|прикачен/i }).first()).toBeVisible();
    }
  });
});
