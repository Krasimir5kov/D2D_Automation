import { expect, test } from '@playwright/test';
import { PreFlightPage } from '../../src/pages/PreFlightPage';

// Scope: group authenticated UI smoke tests.
test.describe('authenticated UI smoke tests', () => {
  // Scope: verify that a test can open the application with the saved setup storageState.
  test('opens the integration application using saved cookies', async ({ page }) => {
    // Scope: skip the example until the integration URL is configured.
    expect(process.env.INTEGRATION_URL, 'Set INTEGRATION_URL in .env before running UI tests.').toBeTruthy();

    // Scope: use a page object so future UI tests have a clean place for page actions.
    const preFlightPage = new PreFlightPage(page);

    // Scope: navigate through the authenticated browser context.
    await preFlightPage.goto();

    // Scope: perform a basic smoke assertion that can be replaced with a real app-specific check.
    await preFlightPage.expectLoaded();
    await preFlightPage.expectMainNavigationReady();
  });
});
