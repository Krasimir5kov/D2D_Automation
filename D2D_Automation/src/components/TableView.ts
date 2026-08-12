// Imports Playwright assertion support and the Page/Locator types used by this table helper.
import { expect, type Locator, type Page } from '@playwright/test';

// Represents common Door2Door table/list behavior.
export class TableView {
  readonly table: Locator;
  readonly rows: Locator;
  readonly loadingCells: Locator;
  readonly emptyStateHeading : Locator;
  readonly emptyStateDescription : Locator;
  // Stores the active Playwright page so table locators can be created from it.
  constructor(private readonly page: Page) {
    this.table = page.locator('table, [role="table"], [class*="Table"]').first();
    // Scoped under this.table (not page-wide) so another table-like element elsewhere
    // on the page can't contribute rows. Scoped to tbody on both halves too — a plain
    // <tr> has an implicit ARIA role of "row" even inside <thead>, so an unscoped
    // `[role="row"]` would also match the header row.
    this.rows = this.table.locator('tbody tr, tbody [role="row"]');
    // While a row is still loading, TableEntry.tsx renders it as one wide placeholder
    // cell (<td colSpan={100}>) instead of the real per-column cells.
    this.loadingCells = this.table.locator('td[colspan="100"]');
    this.emptyStateHeading = page.getByRole('heading', { name: "Kein Ergebnis gefunden", exact: true });
    this.emptyStateDescription = page.getByText("Wählen Sie andere Filter aus, oder setzen Sie alle Filter zurück");
  }

  // Returns the first visible table-like element on a list page.
  // get table(): Locator {
  //   // Uses table, role=table, or class containing "Table"; replace class fallback with data-testid when devs add one.
  //   return this.page.locator('table, [role="table"], [class*="Table"]').first();
  // }

  // // Returns all table row elements.
  // get rows(): Locator {
  //   // Locates standard table rows and ARIA rows.
  //   return this.page.locator('tbody tr, [role="row"]');
  // }

  // Returns a table row containing specific visible text. Generic fallback for pages/
  // rows with no known stable attribute. Baulose/Objekte/Sales Action rows already have
  // a data-display-name attribute (added in POSS-3402) — prefer rowByDisplayName()
  // over this for those, since visible text can shift with formatting/copy changes.
  rowByText(text: string | RegExp): Locator {
    return this.table.locator('tr, [role="row"]').filter({ hasText: text });
  }

  // Returns a table row by its stable data-display-name attribute (Baulose/Objekte/
  // Sales Action rows, POSS-3402). Use this instead of rowByText() when the entity's
  // display name is known.
  rowByDisplayName(name: string): Locator {
    return this.table.locator(`[data-display-name="${name}"]`);
  }

  // Returns the row context menu button for a row containing specific text. Baulose/
  // Objekte/Sales Action row action buttons still don't have a stable id, so `.last()`
  // remains correct for those. Regime, Abschlussgründe, and Aktivitäten Setup rows DO
  // have stable context-menu-button ids now (POSS-3416/3419/3421) — if a page object
  // ever composes TableView against one of those tables, locate its context menu
  // button directly by that page-specific id pattern instead of through this fallback.
  rowContextMenu(text: string | RegExp): Locator {
    return this.rowByText(text).locator('button').last();
  }

  // Verifies that the table/list container is visible.
  async expectVisible(): Promise<void> {
    // Checks the first table-like element found by the table getter.
    await expect(this.table).toBeVisible();
  }
}
