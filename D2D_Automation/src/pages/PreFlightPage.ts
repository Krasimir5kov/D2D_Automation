// Imports the Playwright Page type used by this page object.
import { type Page } from '@playwright/test';
// Imports the shared top navigation helper.
import { AppNavigation } from '../components/AppNavigation';
// Imports shared Door2Door page behavior.
import { BasePage } from './BasePage';

// Represents the preflight smoke page used to prove authenticated UI readiness.
export class PreFlightPage extends BasePage {
  // Shared helper for checking core header navigation.
  readonly navigation: AppNavigation;

  // Builds the preflight page object for the active browser page.
  constructor(page: Page) {
    // Passes the Playwright page into BasePage.
    super(page);
    // Creates the navigation helper for this page.
    this.navigation = new AppNavigation(page);
  }

  // Opens the configured integration URL with saved authentication state.
  async goto(): Promise<void> {
    // Reuses BasePage navigation to INTEGRATION_URL.
    await this.gotoIntegrationUrl();
  }

  // Verifies the Door2Door app mounted after navigation.
  async expectLoaded(): Promise<void> {
    // Checks that the URL is a Door2Door hash route.
    await this.expectDoor2DoorMounted();
  }

  // Verifies the main app navigation is visible and ready.
  async expectMainNavigationReady(): Promise<void> {
    // Checks core links that are expected for normal authenticated users.
    await this.navigation.expectVisible();
  }
}
