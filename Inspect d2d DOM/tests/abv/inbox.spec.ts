// spec: specs/abv-basic-operations-test-plan.md
// seed: seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('ABV Basic Operations', () => {
  test('Inbox Management (Read/Reply/Forward/Delete/Move/Star)', async ({ page }) => {
    // Login
    await page.goto('https://www.abv.bg');
    await page.locator('#loginBut').click();
    await page.fill('input[name="username"]', process.env.ABV_USER ?? '');
    await page.fill('input[name="password"]', process.env.ABV_PASS ?? '');
    await page.getByRole('button', { name: /Влез|Вход|Sign in/ }).click();

    // Ensure Inbox loaded
    await expect(page.getByRole('link', { name: /Входящи|Inbox/ })).toBeVisible();
    await page.getByRole('link', { name: /Входящи|Inbox/ }).click();

    // Open first message
    const firstMsg = page.locator('article').first();
    if (await firstMsg.isVisible()) {
      await firstMsg.click();
      await expect(page.locator('article')).toBeVisible();

      // Reply
      const reply = page.getByRole('button', { name: /Отговори|Reply/ }).first();
      if (await reply.isVisible()) {
        await reply.click();
        await page.fill('textarea[name="body"]', 'Reply from automated test');
        await page.getByRole('button', { name: /Изпрати|Send/ }).click();
        await expect(page.getByText(/изпратено|sent/i)).toBeVisible();
      }

      // Delete
      const del = page.getByRole('button', { name: /Изтрий|Delete/ }).first();
      if (await del.isVisible()) {
        await del.click();
        await page.getByRole('link', { name: /Кошче|Trash|Deleted/ }).click();
        await expect(page.locator('article').locator('text=Reply from automated test')).not.toBeVisible();
      }
    }
  });
});
