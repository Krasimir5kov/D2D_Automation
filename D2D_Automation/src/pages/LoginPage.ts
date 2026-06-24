// Imports Playwright locator and page types for the login page object.
import { type Locator, type Page } from '@playwright/test';
// Imports shared navigation/env helpers from the base page.
import { BasePage } from './BasePage';

// Represents the authentication/login page before storageState is saved.
export class LoginPage extends BasePage {
  // Locator for the username input.
  readonly usernameInput: Locator;
  // Locator for the password input.
  readonly passwordInput: Locator;
  // Locator for the login submit button/link.
  readonly loginButton: Locator;

  // Builds the login page object for the active browser page.
  constructor(page: Page) {
    // Passes the Playwright page into BasePage.
    super(page);
    // Locates the username input by the currently known login id.
    this.usernameInput = page.locator('#login');
    // Locates the password input by the currently known password id.
    this.passwordInput = page.locator('#passwd');
    // Locates the login control by the currently known NSG login id.
    this.loginButton = page.locator('a[id="nsg-x1-logon-button"]');
  }

  // Opens the configured integration URL, which should show the login page when not authenticated.
  async goto(): Promise<void> {
    // Reuses BasePage navigation to INTEGRATION_URL.
    await this.gotoIntegrationUrl();
  }

  // Fills username and password without submitting yet.
  async fillCredentials(username: string, password: string): Promise<void> {
    // Types the username into the username input.
    await this.usernameInput.fill(username);
    // Types the password into the password input.
    await this.passwordInput.fill(password);
  }

  // Submits the login form.
  async submit(): Promise<void> {
    // Clicks the login button/link.
    await this.loginButton.click();
  }

  // Fills credentials and submits in one call.
  async login(username: string, password: string): Promise<void> {
    // Fills both login fields.
    await this.fillCredentials(username, password);
    // Clicks the login control.
    await this.submit();
  }

  // Waits until the application shows a successful login state.
  async waitForSuccessfulLogin(timeoutMs: number): Promise<void> {
    // Uses a configured success selector if the project provides one.
    if (process.env.AUTH_SUCCESS_SELECTOR) {
      // Waits for the configured selector to appear.
      await this.page.locator(process.env.AUTH_SUCCESS_SELECTOR).waitFor({ timeout: timeoutMs });
      // Stops here because the success selector already proved login.
      return;
    }

    // Otherwise waits for the configured success URL pattern, defaulting to a route ending in neubau.
    await this.page.waitForURL(process.env.AUTH_SUCCESS_URL_PATTERN ?? '**/neubau', {
      // Uses the caller-provided timeout, usually based on MANUAL_AUTH_TIMEOUT_MINUTES.
      timeout: timeoutMs,
    });
  }
}
