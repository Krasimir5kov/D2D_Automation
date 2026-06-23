import { test } from '@playwright/test';
import fs from 'fs';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { AUTH_DIR, AUTH_FILE, DEFAULT_MANUAL_AUTH_TIMEOUT_MINUTES } from '../../src/constants/auth';

// Scope: decide before the test starts whether the existing storageState file can be reused.
const shouldReuseExistingAuthState = process.env.REUSE_AUTH_STATE !== 'false' && fs.existsSync(AUTH_FILE);

// Scope: skip the whole setup project before Playwright creates a headed Chrome page.
test.skip(shouldReuseExistingAuthState, `Auth state already exists at ${AUTH_FILE}. Run npm run auth:clear or set REUSE_AUTH_STATE=false to refresh it.`);

// Scope: wait for the tester to confirm that username, password, and both 2FA steps are complete.
async function waitForManualLoginConfirmation(): Promise<void> {
  // Scope: fail clearly when the setup is started in a non-interactive terminal.
  if (!input.isTTY) {
    throw new Error('Manual auth setup needs an interactive terminal so you can press Enter after 2FA.');
  }

  // Scope: open a small terminal prompt while the headed Chrome window stays open.
  const readline = createInterface({ input, output });

  // Scope: always close the prompt after the tester confirms the login state.
  try {
    await readline.question('After login and both 2FA steps are complete in Chrome, press Enter here to save storageState...');
  } finally {
    readline.close();
  }
}

// Scope: setup project test that creates the storageState file used by all dependent tests.
test('manual login saves storage state for dependent projects', async ({ page }) => {
  // Scope: require the integration URL because the setup project must open the real login page.
  const integrationUrl = process.env.INTEGRATION_URL;
  if (!integrationUrl) {
    throw new Error('Set INTEGRATION_URL in .env before running the setup project.');
  }

  // Scope: calculate the manual login timeout from .env or use the default value.
  const timeoutMinutes = Number(process.env.MANUAL_AUTH_TIMEOUT_MINUTES ?? DEFAULT_MANUAL_AUTH_TIMEOUT_MINUTES);
  if (!Number.isFinite(timeoutMinutes) || timeoutMinutes <= 0) {
    throw new Error('MANUAL_AUTH_TIMEOUT_MINUTES must be a positive number.');
  }

  // Scope: give the tester enough time to complete username, password, and two 2FA prompts.
  const timeoutMs = timeoutMinutes * 60 * 1000;
  test.setTimeout(timeoutMs + 30_000);

  // Scope: open the integration login page in headed Chrome.
  await page.goto(integrationUrl, { waitUntil: 'domcontentloaded' });

  // Scope: optionally wait automatically for a known successful login selector.
  if (process.env.AUTH_SUCCESS_SELECTOR) {
    await page.locator(process.env.AUTH_SUCCESS_SELECTOR).waitFor({ timeout: timeoutMs });
  }
  // Scope: optionally wait automatically for a known successful login URL pattern.
  else if (process.env.AUTH_SUCCESS_URL_PATTERN) {
    await page.waitForURL(process.env.AUTH_SUCCESS_URL_PATTERN, { timeout: timeoutMs });
  }
  // Scope: otherwise let the tester press Enter after both 2FA steps are complete.
  else {
    await waitForManualLoginConfirmation();
  }

  // Scope: ensure the auth folder exists before writing the storageState JSON file.
  await fs.promises.mkdir(AUTH_DIR, { recursive: true });

  // Scope: save cookies and localStorage so all dependent UI and API tests can reuse the login state.
  await page.context().storageState({ path: AUTH_FILE });
});
