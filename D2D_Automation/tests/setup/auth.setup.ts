import { test } from '@playwright/test';
import fs from 'fs';
import { AUTH_DIR, AUTH_FILE, DEFAULT_MANUAL_AUTH_TIMEOUT_MINUTES } from '../../src/constants/auth';
import { LoginPage } from '../../src/pages/LoginPage';

// Scope: decide before the test starts whether the existing storageState file can be reused.
const shouldReuseExistingAuthState = process.env.REUSE_AUTH_STATE !== 'false' && fs.existsSync(AUTH_FILE);

// Scope: skip the whole setup project before Playwright creates a headed Chrome page.
test.skip(shouldReuseExistingAuthState, `Auth state already exists at ${AUTH_FILE}. Run npm run auth:clear or set REUSE_AUTH_STATE=false to refresh it.`);

// Scope: wait for the tester to confirm that username, password, and both 2FA steps are complete.
function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Set ${name} in .env before running auth setup.`);
  }

  return value;
}

test('login saves storage state for dependent projects', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Scope: calculate the login timeout from .env or use the default value.
  const timeoutMinutes = Number(process.env.MANUAL_AUTH_TIMEOUT_MINUTES ?? DEFAULT_MANUAL_AUTH_TIMEOUT_MINUTES);
  if (!Number.isFinite(timeoutMinutes) || timeoutMinutes <= 0) {
    throw new Error('MANUAL_AUTH_TIMEOUT_MINUTES must be a positive number.');
  }

  const timeoutMs = timeoutMinutes * 60 * 1000;
  test.setTimeout(timeoutMs + 30_000);

  await loginPage.goto();
  await loginPage.fillCredentials(requireEnv('AUTH_USERNAME'), requireEnv('AUTH_PASSWORD'));

  await Promise.all([
    loginPage.waitForSuccessfulLogin(timeoutMs),
    loginPage.submit(),
  ]);

  await fs.promises.mkdir(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});
