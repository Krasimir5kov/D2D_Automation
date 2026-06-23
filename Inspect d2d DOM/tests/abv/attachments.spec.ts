// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('ABV Basic Operations', () => {
  test('Attachments and Size Limits', async ({ page }) => {
    // Login
    await page.goto('https://www.abv.bg');
    await page.locator('#loginBut').click();
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', process.env.ABV_PASS ?? '');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();

    // Open Compose
    await page.getByRole('button', { name: /Състави|Compose|New message/ }).click();

    // Attach small file
    const small = path.resolve(__dirname, '..', 'fixtures', 'small.txt');
    await page.setInputFiles('input[type="file"]', small);
    await expect(page.getByText(/small.txt|uploaded/i)).toBeVisible();

    // Attempt attach large file placeholder (should be present in fixtures if available)
    const large = path.resolve(__dirname, '..', 'fixtures', 'large.zip');
    await page.setInputFiles('input[type="file"]', large);
    await expect(page.getByText(/size|превишава|exceed/i)).toBeVisible();
  });
});
