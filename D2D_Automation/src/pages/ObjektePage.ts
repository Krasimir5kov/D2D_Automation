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
  // Shared top navigation heler.
  readonly navigation: AppNavigation;
  readonly filters: FilterBar;
  readonly modal: ModalDialog;
  readonly neubauSidePanel: SidePanel;
  readonly ftthAusbauSidePanel: SidePanel;
  readonly bestandsbauSidePanel: SidePanel;
  readonly table: TableView;
  readonly searchInput: Locator;
  readonly neubauTab: Locator;
  readonly ftthTab: Locator;
  readonly bestandsbauTab: Locator;
  readonly baulosEinsatznameFilter: Locator;
  readonly plzFilter: Locator;
  readonly fragenBogenFilterStatus: Locator;
  readonly verkaufsstartFilter: Locator;
  readonly plzFromInput: Locator;
  readonly plzOutInput: Locator;
  readonly quickFilterOpenButton: Locator;
  readonly quickFilterRejectButton: Locator;
  readonly quickFilterAssignedButton: Locator;
  readonly searchInputField: Locator;
  readonly neubauObjectName: Locator;
  readonly ftthObjectName: Locator;
  readonly bestandsbauObjectName: Locator;
  readonly emptyStateHeadingMessageBySearchInput: Locator;
  readonly emptyStateDescriptionMessageBySearchInput: Locator;


  constructor(page: Page) {
    super(page);
    this.navigation = new AppNavigation(page);
    this.filters = new FilterBar(page);
    this.modal = new ModalDialog(page);
    this.neubauSidePanel = new SidePanel(page, 'neubau-object-side-panel', page.locator('#neubau-object-side-panel-close-button'));
    this.ftthAusbauSidePanel = new SidePanel(page, 'ftth-object-side-panel', page.locator('#ftth-object-side-panel-close-button'));
    this.bestandsbauSidePanel = new SidePanel(page, 'bestandsbau-object-side-panel', page.locator('#bestandsbau-object-side-panel-close-button'));
    this.table = new TableView(page);
    this.searchInput = page.locator('#objects-search-field');
    this.neubauTab = page.getByRole('link', { name: /Neubau/i }).or(page.getByRole('tab', { name: /Neubau/i }));
    this.ftthTab = page.getByRole('link', { name: /FTTH/i }).or(page.getByRole('tab', { name: /FTTH/i }));
    this.bestandsbauTab = page.getByRole('link', { name: /Bestandsbau/i }).or(
      page.getByRole('tab', { name: /Bestandsbau/i }),
    );
    this.plzFromInput = page.locator('#filter-dropdown-root').getByRole('textbox', { name: 'PLZ ab' });
    this.plzOutInput = page.locator('#filter-dropdown-root').getByRole('textbox', { name: 'PLZ bis' });
    this.baulosEinsatznameFilter = page.locator('#contractSection');
    this.plzFilter = page.locator('#zip');
    this.verkaufsstartFilter = page.locator('#salesStart');
    this.fragenBogenFilterStatus = page.locator('#fragebogenStatus');
    this.quickFilterAssignedButton = page.locator('#quick-filter-objectStatus-assigned');
    this.quickFilterRejectButton = page.locator('#quick-filter-objectStatus-rejected');
    this.quickFilterOpenButton = page.locator('#quick-filter-objectStatus-open');
    this.searchInputField = page.locator('#objects-search-field');
    this.neubauObjectName = page.locator('tr[data-object-type="NEUBAU"]');
    this.ftthObjectName = page.locator('tr[data-object-type="FTTH"]');
    this.bestandsbauObjectName = page.locator('tr[data-object-type="BESTANDSBAU"]');
    this.emptyStateHeadingMessageBySearchInput = page.getByRole('heading', { name: 'Kein Ergebnis gefunden' });
    this.emptyStateDescriptionMessageBySearchInput = page.getByText("Es wurden keine Ergebnisse zu Ihrer Eingabe gefunden. Ändern Sie Ihre Sucheingabe oder setzen Sie die Suche zurück");
  }

  async goToObjektePage(): Promise<void> {
    await this.gotoDoor2DoorRoute(door2doorRoutes.objekte.main);
  }

  async expectLoadedObjekte(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/objekte/);
    await expect(this.searchInput).toBeVisible();
  }
  // Opens the Objekte Neubau route directly.
  async gotoNeubauSection(): Promise<void> {
    // Navigates to the confirmed Objekte route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.objekte.neubau);
  }
  async gotoFtthSection(): Promise<void> {
    await this.gotoDoor2DoorRoute(door2doorRoutes.objekte.ftth);
  }
  async gotoBestandsbauSection(): Promise<void> {
    await this.gotoDoor2DoorRoute(door2doorRoutes.objekte.bestandsbau);
  }

  // Verifies the Objekte page loaded.
  async expectLoadedNeubau(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        // Checks that the URL is the Objekte Neubau route.
        await expect(this.page).toHaveURL(/\/door2door#\/objekte\/neubau/);
        // Checks that the Objekte search field is visible.
        await expect(this.searchInput).toBeVisible();
      },
      () => this.navigation.goToBaulose(),
      async () => {
        await this.navigation.goToObjekte();
        await this.neubauTab.click();
      },
    );
  }
  async expectLoadedFtth(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        await expect(this.page).toHaveURL(/\/door2door#\/objekte\/ftth/);
        await expect(this.searchInput).toBeVisible();
      },
      () => this.navigation.goToBaulose(),
      async () => {
        await this.navigation.goToObjekte();
        await this.ftthTab.click();
      },
    );
  }
  async expectLoadedBestandsbau(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        await expect(this.page).toHaveURL(/\/door2door#\/objekte\/bestandsbau/);
        await expect(this.searchInput).toBeVisible();
      },
      () => this.navigation.goToBaulose(),
      async () => {
        await this.navigation.goToObjekte();
        await this.bestandsbauTab.click();
      },
    );
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