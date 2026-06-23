// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Drafts / Autosave', async ({ page }) => {
    // Login
    await page.goto('https://www.abv.bg');
    await page.locator('#loginBut').click();
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', process.env.ABV_PASS ?? '');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();

    // Open Compose and type to trigger autosave
    await page.getByRole('button', { name: /Състави|Compose|New message/ }).click();
    await page.fill('input[name="subject"]', `Draft Test ${Date.now()}`);
    await page.fill('textarea[name="body"]', 'This draft should autosave.');

    // Wait for autosave indicator (selector may need tweak)
    await expect(page.getByText(/запазено|autosa|Autosave|autosaved/i)).toBeVisible();

    // Verify draft appears in Drafts folder
    await page.getByRole('link', { name: /Чернови|Drafts/ }).click();
    await expect(page.getByText(/Draft Test/)).toBeVisible();
  });
});
