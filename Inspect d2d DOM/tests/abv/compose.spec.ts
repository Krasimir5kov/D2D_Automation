// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Compose & Send Email', async ({ page }) => {
    // Assumptions: test account credentials available via env vars
    await page.goto('https://www.abv.bg');
    await page.locator('#loginBut').click();
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', process.env.ABV_PASS ?? '');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();

    // Open Compose
    await expect(page.getByRole('button', { name: /Състави|Compose|New message/ })).toBeVisible();
    await page.getByRole('button', { name: /Състави|Compose|New message/ }).click();

    // Fill To, Subject, Body
    const subject = `E2E Test ${Date.now()}`;
    await page.fill('input[name="to"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="subject"]', subject);
    await page.fill('textarea[name="body"]', 'This is an automated test message.');

    // Send
    await page.getByRole('button', { name: /Изпрати|Send/ }).click();
    await expect(page.getByText(/изпратено|sent|успешно/i)).toBeVisible();

    // Verify in Sent (simple navigation)
    await page.getByRole('link', { name: /Изпратени|Sent/ }).click();
    await expect(page.getByText(subject)).toBeVisible();
  });
});
