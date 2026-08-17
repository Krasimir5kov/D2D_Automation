// Imports Playwright assertions and types for the Sales Actions page object.
import { expect, type Locator, type Page } from '@playwright/test';
// Imports the shared top navigation helper.
import { AppNavigation } from '../components/AppNavigation';
// Imports the shared filter bar helper.
import { FilterBar } from '../components/FilterBar';
// Imports the shared modal helper.
import { ModalDialog } from '../components/ModalDialog';
// Imports the shared side panel helper; current selector is a placeholder until the real DOM class or data-testid is known.
import { SidePanel } from '../components/SidePanel';
// Imports the shared table helper.
import { TableView } from '../components/TableView';
// Imports shared page behavior and known Door2Door routes.
import { BasePage, door2doorRoutes } from './BasePage';

// Represents the Sales Actions main page.
export class SalesActionsPage extends BasePage {
  // Shared top navigation helper.
  readonly navigation: AppNavigation;
  // Shared filter bar helper.
  readonly filters: FilterBar;
  // Shared modal helper for Alle Filter and other dialogs.
  readonly modal: ModalDialog;
  // Shared side panel helper for Sales Action details; update its root when stable DOM attributes exist.
  readonly sidePanel: SidePanel;
  // Shared table/list helper.
  readonly table: TableView;
  // Locator for the Sales Actions search input.
  readonly searchInput: Locator;
  // Locator for the Neubau tab.
  readonly neubauTab: Locator;
  // Locator for the FTTH tab.
  readonly ftthTab: Locator;
  // Locator for the Bestandsbau tab.
  readonly bestandsbauTab: Locator;
  // Locator for Neubau List view
  readonly neubauListView : Locator;
  // Locator for FTTH List view
  readonly ftthAusbauListView : Locator;
  // Locator for Bestandsbau List view
  readonly bestandsbauTabListView : Locator;

  // Builds the Sales Actions page object for the active browser page.
  constructor(page: Page) {
    // Passes the Playwright page into BasePage.
    super(page);
    // Creates a helper for top navigation links.
    this.navigation = new AppNavigation(page);
    // Creates a helper for inline filters.
    this.filters = new FilterBar(page);
    // Creates a helper for modal dialogs.
    this.modal = new ModalDialog(page);
    // Creates a helper for the right-side Sales Action detail panel.
    this.sidePanel = new SidePanel(page, 'sales-action-panel', page.getByRole('button', { name: /schließen|close/i }));
    // Creates a helper for table/list behavior.
    this.table = new TableView(page);
    // Locates the search input using known test id/id first, then a generic Suche placeholder fallback.
    this.searchInput = page.locator('#sales-actions-search-field').or(page.locator('input[placeholder="Suche"]'));
    // Locates the Neubau tab by link role or tab role.
    this.neubauTab = page.getByRole('link', { name: /Neubau/i }).or(page.getByRole('tab', { name: /Neubau/i }));
    // Locates the FTTH tab by link role or tab role.
    this.ftthTab = page.getByRole('link', { name: /FTTH/i }).or(page.getByRole('tab', { name: /FTTH/i }));
    // Locates the Bestandsbau tab by link role or tab role.
    this.bestandsbauTab = page.getByRole('link', { name: /Bestandsbau/i }).or(
      // Falls back to role=tab if the tab component exposes ARIA tab semantics.
      page.getByRole('tab', { name: /Bestandsbau/i }),
    );
    this.neubauListView = page.getByRole(`table`)
    this.ftthAusbauListView = page.getByRole(`table`)
    this.bestandsbauTabListView = page.getByRole(`table`)

  }

  // Opens the Sales Actions Neubau route directly.
  async goto(): Promise<void> {
    // Navigates to the confirmed Sales Actions route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.salesActions.neubau);
  }

  // Verifies the Sales Actions Neubau section loaded.
  async expectLoadedNeubau(): Promise<void> {
    // Checks that the URL is the Sales Actions Neubau route.
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/neubau/);
    // Checks that the Sales Actions search field is visible.
    await expect(this.searchInput).toBeVisible();
  }

  // Verifies the Sales Actions FTTH section loaded.
  async expectLoadedFTTH(): Promise<void> {
    // Checks that the URL is the Sales Actions FTTH route.
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/ftth/);
    // Checks that the Sales Actions search field is visible.
    await expect(this.searchInput).toBeVisible();
  }

  // Verifies the Sales Actions Bestandsbau section loaded.
  async expectLoadedBestandsbau(): Promise<void> {
    // Checks that the URL is the Sales Actions Bestandsbau route.
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/bestandsbau/);
    // Checks that the Sales Actions search field is visible.
    await expect(this.searchInput).toBeVisible();
  }

  // Searches the Sales Actions list.
  async search(text: string): Promise<void> {
    // Fills the Sales Actions search input.
    await this.searchInput.fill(text);
    // Presses Enter to submit/apply the search.
    await this.searchInput.press('Enter');
  }

  // Opens the Alle Filter modal from the Sales Actions page.
  async openAllFilters(): Promise<void> {
    // Opens the filter modal; note the current FilterBar method name may need alignment if it was renamed.
    await this.filters.openAllFiltersInAlleFilterModal();
    // Verifies a filter modal opened.
    await this.modal.expectOpen(/Filter/i);
  }

  // Opens a Sales Action row by visible text.
  async openSalesActionRow(text: string | RegExp): Promise<void> {
    // Clicks the row matching the supplied Sales Action text.
    await this.table.rowByText(text).click();
  }
  
}
