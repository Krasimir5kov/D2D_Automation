import { expect, type Page } from '@playwright/test';

// Scope: keep home page actions and checks in one reusable page object.
export class HomePage {
  // Scope: store the Playwright page that this page object controls.
  constructor(private readonly page: Page) {}

  // Scope: open the application home page using the configured INTEGRATION_URL base URL.
  async goto(): Promise<void> {
    // Scope: use the full integration URL because this app uses a hash route that URL resolution would drop from "/".
    await this.page.goto(process.env.INTEGRATION_URL ?? '/', { waitUntil: 'domcontentloaded' });
  }

  // Scope: make a very small smoke assertion that the page has loaded to some valid URL.
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/.+/);
  }
}
