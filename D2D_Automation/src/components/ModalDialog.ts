// Imports Playwright assertion support and the Page/Locator types used by this modal helper.
import { expect, type Locator, type Page } from '@playwright/test';

// Represents generic Door2Door modal dialogs such as Alle Filter, Benutzer erstellen, or Daten importieren.
export class ModalDialog {
  // Stores the active Playwright page so modal locators can be created from it.
  constructor(private readonly page: Page) {}

  // Returns any currently rendered modal dialog.
  get any(): Locator {
    // Uses role=dialog because the provided DOM snippets include role="dialog" on the modal wrapper.
    return this.page.getByRole('dialog');
  }

  // Returns a modal dialog that contains specific visible text.
  byText(text: string | RegExp): Locator {
    // Filters the generic dialog by title/body text, because many modals share aria-label="Modal Fenster".
    return this.any.filter({ hasText: text });
  }

  // Verifies that a modal is visible, optionally matching specific title/body text.
  async expectOpen(text?: string | RegExp): Promise<void> {
    // Checks the text-specific modal when text is passed, otherwise checks any dialog.
    await expect(text ? this.byText(text) : this.any).toBeVisible();
  }

  // Closes the active modal by pressing Escape.
  async closeWithEscape(): Promise<void> {
    // Sends Escape to the page; useful because current close icon buttons do not have stable aria-labels.
    await this.page.keyboard.press('Escape');
  }
}
