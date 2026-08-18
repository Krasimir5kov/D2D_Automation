// Imports Playwright assertions and types for the Objekte page object.
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

// Represents the Objekte main page.
export class ObjektePage extends BasePage {
  // Shared top navigation helper.
  readonly navigation: AppNavigation;
  // Shared filter bar helper.
  readonly filters: FilterBar;
  // Shared modal helper for Alle Filter and other dialogs.
  readonly modal: ModalDialog;
  // Shared side panel helper for object details; update its root when stable DOM attributes exist.
  readonly neubauSidePanel: SidePanel;
  readonly ftthAusbauSidePanel: SidePanel;
  readonly bestandsbauSidePanel: SidePanel;
  // Shared table/list helper.
  readonly table: TableView;
  // Locator for the Objekte search input.
  readonly searchInput: Locator;
  // Locator for the Neubau tab.
  readonly neubauTab: Locator;
  // Locator for the FTTH tab.
  readonly ftthTab: Locator;
  // Locator for the Bestandsbau tab.
  readonly bestandsbauTab: Locator;

  // Builds the Objekte page object for the active browser page.
  constructor(page: Page) {
    // Passes the Playwright page into BasePage.
    super(page);
    // Creates a helper for top navigation links.
    this.navigation = new AppNavigation(page);
    // Creates a helper for inline filters.
    this.filters = new FilterBar(page);
    // Creates a helper for modal dialogs.
    this.modal = new ModalDialog(page);
    // Creates a helper for the right-side object detail panel.
    this.neubauSidePanel = new SidePanel(page,'neubau-object-side-panel', page.locator('#neubau-object-side-panel-close-button'));
    this.ftthAusbauSidePanel = new SidePanel(page,'ftth-object-side-panel', page.locator('#ftth-object-side-panel-close-button'));
    this.bestandsbauSidePanel = new SidePanel(page,'bestandsbau-object-side-panel', page.locator('#bestandsbau-object-side-panel-close-button'));
    // Creates a helper for table/list behavior.
    this.table = new TableView(page);
    // Locates the search input using known test id/id first, then a generic Suche placeholder fallback.
    this.searchInput = page.locator('[data-testid="objects-search-field"], #objects-search-field, input[placeholder*="Suche"]').first();
    // Locates the Neubau tab by link role or tab role.
    this.neubauTab = page.getByRole('link', { name: /Neubau/i }).or(page.getByRole('tab', { name: /Neubau/i }));
    // Locates the FTTH tab by link role or tab role.
    this.ftthTab = page.getByRole('link', { name: /FTTH/i }).or(page.getByRole('tab', { name: /FTTH/i }));
    // Locates the Bestandsbau tab by link role or tab role.
    this.bestandsbauTab = page.getByRole('link', { name: /Bestandsbau/i }).or(
      // Falls back to role=tab if the tab component exposes ARIA tab semantics.
      page.getByRole('tab', { name: /Bestandsbau/i }),
    );
  }

  // Opens the Objekte Neubau route directly.
  async goto(): Promise<void> {
    // Navigates to the confirmed Objekte route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.objekte.neubau);
  }

  // Verifies the Objekte page loaded.
  async expectLoaded(): Promise<void> {
    // Checks that the URL is the Objekte Neubau route.
    await expect(this.page).toHaveURL(/\/door2door#\/objekte\/neubau/);
    // Checks that the Objekte search field is visible.
    await expect(this.searchInput).toBeVisible();
  }

  // Searches the Objekte list.
  async search(text: string): Promise<void> {
    // Fills the Objekte search input.
    await this.searchInput.fill(text);
    // Presses Enter to submit/apply the search.
    await this.searchInput.press('Enter');
  }

  // Opens the Alle Filter modal from the Objekte page.
  async openAllFilters(): Promise<void> {
    // Opens the filter modal; note the current FilterBar method name may need alignment if it was renamed.
    await this.filters.openAllFiltersInAlleFilterModal();
    // Verifies a filter modal opened.
    await this.modal.expectOpen(/Filter/i);
  }

  // Opens an object row by visible text.
  async openObjectRow(text: string | RegExp): Promise<void> {
    // Clicks the row matching the supplied object/address text.
    await this.table.rowByText(text).click();
  }
  async expectNeubauObjectSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/objekte\/neubau\/\d+/);
    await expect(this.neubauSidePanel.root).toBeVisible();
  }
  async expectFtthObjectSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/objekte\/ftth\/\d+/);
    await expect(this.ftthAusbauSidePanel.root).toBeVisible();
  }
  async expectBestandsbauObjectSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/objekte\/bestandsbau\/\d+/);
    await expect(this.bestandsbauSidePanel.root).toBeVisible();
  }
}
