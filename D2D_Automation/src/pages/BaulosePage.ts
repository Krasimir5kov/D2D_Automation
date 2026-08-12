// Imports Playwright assertions and types for the Baulose page object.
import { expect, type Locator, type Page } from '@playwright/test';
// Imports the shared top navigation helper.
import { AppNavigation } from '../components/AppNavigation';
// Imports the shared filter bar helper.
import { FilterBar } from '../components/FilterBar';
// Imports the shared table helper.
import { TableView } from '../components/TableView';
// Imports shared page behavior and known Door2Door routes.
import { BasePage, door2doorRoutes } from './BasePage';
import { SearchField } from '../components/SearchField';

// Represents the Baulose main page.
export class BaulosePage extends BasePage {
  // Shared top navigation helper.
  readonly navigation: AppNavigation;
  // Shared filter bar helper.
  readonly filters: FilterBar;
  // Shared table/list helper.
  readonly table: TableView;
  // Locator for the Baulose search input.
  // readonly searchInput: Locator;
  readonly searchField: SearchField;
  // Locator for the FTTH tab.
  readonly ftthTab: Locator;
  // Locator for the Bestandsbau tab.
  readonly bestandsbauTab: Locator;
  
  

  // Builds the Baulose page object for the active browser page.
  constructor(page: Page) {
    // Passes the Playwright page into BasePage.
    super(page);
    // Creates a helper for top navigation links.
    this.navigation = new AppNavigation(page);
    // Creates a helper for inline filters.
    this.filters = new FilterBar(page);
    // Creates a helper for table/list behavior.
    this.table = new TableView(page);
    // Locates the Baulose search input using known test id/id first, then placeholder text as fallback.
    this.searchField = new SearchField(page, page.locator('input[id="baulose-search-field"]').or(
      // Uses the documented placeholder fallback from the DOM investigation.
      page.getByPlaceholder(/Suche nach Baulose\/Einsatznamen/i),
    ));
    // this.searchInput
    //  = page.locator('[data-testid="baulose-search-field"], #baulose-search-field').or(
    //   // Uses the documented placeholder fallback from the DOM investigation.
    //   page.getByPlaceholder(/Suche nach Baulose\/Einsatznamen/i),
    //  )
    // Locates the FTTH tab by link role or tab role depending on how the component renders.
    this.ftthTab = page.getByRole('link', { name: /FTTH/i }).or(page.getByRole('tab', { name: /FTTH/i }));
    // Locates the Bestandsbau tab by link role or tab role depending on how the component renders.
    this.bestandsbauTab = page.getByRole('link', { name: /Bestandsbau/i }).or(
      // Falls back to role=tab if the tab component exposes ARIA tab semantics.
      page.getByRole('tab', { name: /Bestandsbau/i }),
    );
  }

  // Opens the Baulose FTTH route directly.
  // async goto(): Promise<void> {
  //   // Navigates to the confirmed Baulose route.
  //   await this.gotoDoor2DoorRoute(door2doorRoutes.baulose.ftth);
  // }
  async gotoBestandsbauListSection(): Promise<void> {
    // Navigates to the confirmed Baulose route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.baulose.bestandsbau);
  }
  async gotoFTTHListSection(): Promise<void> {
    // Navigates to the confirmed Baulose route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.baulose.ftth);
  }
  // Verifies the Baulose page loaded.
  // async expectLoaded(): Promise<void> {
  //   // Checks that the URL is the Baulose FTTH route.
  //   await expect(this.page).toHaveURL(/\/door2door#\/baulose\/ftth/);
  //   // Checks that the Baulose search field is visible.
  //   await this.searchField.expectVisible();
  // }
  async expectLoadedBestandsbau(): Promise<void> {
    // Checks that the URL is the Baulose Bestandsbau route.
    await expect(this.page).toHaveURL(/\/door2door#\/baulose\/bestandsbau/);
    // "Importdatum" is a column only Bestandsbau's table has — waiting for it confirms
    // the Bestandsbau-specific table has actually rendered, not just that the URL
    // changed. Without this, stale FTTH rows could still be showing (and coincidentally
    // match whatever filter was just applied) for a moment after navigating here.
    await expect(this.page.getByRole('cell', { name: 'Importdatum' })).toBeVisible();
  }
  async expectLoadedFTTH(): Promise<void> {
    // Checks that the URL is the Baulose FTTH route.
    await expect(this.page).toHaveURL(/\/door2door#\/baulose\/ftth/);
    // "Baulose / Regime" is a column only FTTH's table has — same reasoning as above,
    // for the opposite direction (stale Bestandsbau rows after navigating to FTTH).
    await expect(this.page.getByRole('cell', { name: 'Baulos / Regime' })).toBeVisible();
  }

  // Searches the Baulose list.
  async search(text: string): Promise<void> {
    // Fills the Baulose search input.
    await this.searchField.search(text);
    // Presses Enter to submit/apply the search.
    await this.searchField.expectVisible();
  }

  // Opens the Organisation filter on Baulose. Uses the stable id-based trigger, not
  // visible-name matching — the trigger's accessible name grows a "(N)" suffix once a
  // choice is applied (e.g. "Organisation" -> "Organisation (1)"), which would break a
  // name-based locator on any reopen after the first use.
  async openOrganisationFilter(): Promise<void> {
    await this.filters.organisationFilterOpen();
  }

  // Opens the Regime filter on Baulose. Same stable-id reasoning as openOrganisationFilter.
  async openRegimeFilter(): Promise<void> {
    await this.filters.regimeFilterOpen();
  }

  // Opens the Phase filter on Baulose. Same stable-id reasoning as openOrganisationFilter.
  async openPhaseFilter(): Promise<void> {
    await this.filters.phaseFilterOpen();
  }

  // Opens the Status filter on Baulose. Same stable-id reasoning as openOrganisationFilter.
  async openStatusFilter(): Promise<void> {
    await this.filters.statusFilterOpen();
  }

  // Opens the Importdatum filter bar button on Baulose. Same stable-id reasoning as
  // openOrganisationFilter.
  async openImportDateFilter(): Promise<void> {
    await this.filters.importDateFilterOpen();
  }
}
