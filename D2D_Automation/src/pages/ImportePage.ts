// Imports Playwright assertions and types for the Importe page object.
import { expect, type Locator, type Page } from '@playwright/test';
// Imports the shared top navigation helper.
import { AppNavigation } from '../components/AppNavigation';
// Imports the shared filter bar helper.
import { FilterBar } from '../components/FilterBar';
// Imports the shared modal helper.
import { ModalDialog } from '../components/ModalDialog';
// Imports the shared table helper.
import { TableView } from '../components/TableView';
// Imports shared page behavior and known Door2Door routes.
import { BasePage, door2doorRoutes } from './BasePage';

// Represents the Importe main page.
export class ImportePage extends BasePage {
  // Shared top navigation helper.
  readonly navigation: AppNavigation;
  // Shared filter bar helper.
  readonly filters: FilterBar;
  // Shared modal helper for import/change-organisation dialogs.
  readonly modal: ModalDialog;
  // Shared table/list helper.
  readonly table: TableView;
  // Locator for the Importe search input.
  readonly searchInput: Locator;
  // Locator for the Organisation wechseln button.
  readonly changeOrganisationButton: Locator;
  // Locator for the Daten importieren button.
  readonly importDataButton: Locator;
  // Locator for the file input used by import upload flows.
  readonly fileInput: Locator;

  // Builds the Importe page object for the active browser page.
  constructor(page: Page) {
    // Passes the Playwright page into BasePage.
    super(page);
    // Creates a helper for top navigation links.
    this.navigation = new AppNavigation(page);
    // Creates a helper for inline filters.
    this.filters = new FilterBar(page);
    // Creates a helper for modal dialogs.
    this.modal = new ModalDialog(page);
    // Creates a helper for table/list behavior.
    this.table = new TableView(page);
    // Locates the Importe search input using known test id/id first, then placeholder text as fallback.
    this.searchInput = page.locator('[data-testid="imports-search-field"], #imports-search-field').or(
      // Uses the documented Importe search placeholder fallback.
      page.getByPlaceholder(/Suche in Importe/i),
    );
    // Locates the Organisation wechseln action button by visible text.
    this.changeOrganisationButton = page.getByRole('button', { name: /Organisation wechseln/i });
    // Locates the Daten importieren action button by visible text.
    this.importDataButton = page.getByRole('button', { name: /Daten importieren/i });
    // Locates file inputs; replace with data-testid such as imports-file-input when developers add it.
    this.fileInput = page.locator('input[type="file"]');
  }

  // Opens the Importe route directly.
  async goto(): Promise<void> {
    // Navigates to the confirmed Importe route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.importe);
  }

  // Verifies the Importe page loaded.
  async expectLoaded(): Promise<void> {
    // Checks that the URL is the Importe route.
    await expect(this.page).toHaveURL(/\/door2door#\/importe/);
    // Checks that the Importe search field is visible.
    await expect(this.searchInput).toBeVisible();
  }

  // Searches the Importe list.
  async search(text: string): Promise<void> {
    // Fills the Importe search input.
    await this.searchInput.fill(text);
    // Presses Enter to submit/apply the search.
    await this.searchInput.press('Enter');
  }

  // Opens the Daten importieren modal dialog.
  async openImportDialog(): Promise<void> {
    // Clicks the Daten importieren button.
    await this.importDataButton.click();
    // Verifies an import-related dialog opened.
    await this.modal.expectOpen(/Import|Daten importieren/i);
  }
}
