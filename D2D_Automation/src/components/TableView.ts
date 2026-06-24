// Imports Playwright assertion support and the Page/Locator types used by this table helper.
import { expect, type Locator, type Page } from '@playwright/test';

// Represents common Door2Door table/list behavior.
export class TableView {
  // Stores the active Playwright page so table locators can be created from it.
  constructor(private readonly page: Page) {}

  // Returns the first visible table-like element on a list page.
  get table(): Locator {
    // Uses table, role=table, or class containing "Table"; replace class fallback with data-testid when devs add one.
    return this.page.locator('table, [role="table"], [class*="Table"]').first();
  }

  // Returns all table row elements.
  get rows(): Locator {
    // Locates standard table rows and ARIA rows.
    return this.page.locator('tbody tr, [role="row"]');
  }

  // Returns a table row containing specific visible text.
  rowByText(text: string | RegExp): Locator {
    // Filters rows by text until rows get stable entity attributes like data-object-id or data-sales-action-id.
    return this.page.locator('tr, [role="row"]').filter({ hasText: text });
  }

  // Returns the row context menu button for a row containing specific text.
  rowContextMenu(text: string | RegExp): Locator {
    // Uses the last button in the row because current row action buttons lack stable aria-labels or data-testid attributes.
    return this.rowByText(text).locator('button').last();
  }

  // Verifies that the table/list container is visible.
  async expectVisible(): Promise<void> {
    // Checks the first table-like element found by the table getter.
    await expect(this.table).toBeVisible();
  }
}
