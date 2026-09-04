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
  // Locator for Navigation button in the table row for a given Baulos.
  readonly rowNavigationButton : Locator;
  // Empty-state heading/message shown when an applied filter yields zero rows.
  // Baulose-specific text — Sales Actions shows a different message for its own
  // empty state, so this doesn't belong on the shared TableView.
 
  readonly emptyStateHeadingBySearchInput: Locator;
  readonly emptyStateDescriptionBySearchInput: Locator;
  // Clears the Baulose search input — Baulose-specific (targets #baulose-search-field),
  // so it lives here rather than on the shared SearchField component.
  readonly cleanSearchInputButton: Locator;

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
    this.searchField = new SearchField(page, page.locator('#baulose-search-field').or(
      // Uses the documented placeholder fallback from the DOM investigation.
      page.getByPlaceholder(/Suche nach Baulose\/Einsatznamen.../i),
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
    this.rowNavigationButton = this.table.rows.getByRole('button', { name: /zu Sales Actions/i });
     this.emptyStateHeadingBySearchInput = page.getByRole('heading', { name: 'Keine Baulose/Einsatznamen gefunden', exact: true });
    this.emptyStateDescriptionBySearchInput = page.getByText('Es wurden keine Baulose/Einsatznamen zu Ihrer Eingabe gefunden. Ändern Sie Ihre Sucheingabe oder setzen Sie die Suche zurück');
    this.cleanSearchInputButton = page.locator('#baulose-search-field').locator('..').getByRole('button').first();
  }

  // Opens the bare Baulose route — the real app auto-redirects this to FTTH-AUSBAU.
  async goToBaulosePage(): Promise<void> {
    await this.gotoDoor2DoorRoute(door2doorRoutes.baulose.main);
  }

  // Verifies the bare Baulose route loaded and redirected to FTTH-AUSBAU as expected.
  async expectLoadedBaulose(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        await expect(this.page).toHaveURL(/\/door2door#\/baulose\/ftth/);
        await this.searchField.expectVisible();
        await this.searchField.expectPlaceholder(/Suche nach Baulose\/Einsatznamen/i);
      },
      () => this.navigation.goToObjekte(),
      async () => {
        await this.navigation.goToBaulose();
        await this.ftthTab.click();
      },
    );
  }

  async gotoBestandsbauListSection(): Promise<void> {
    // Navigates to the confirmed Baulose route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.baulose.bestandsbau);
  }
  async gotoFTTHListSection(): Promise<void> {
    // Navigates to the confirmed Baulose route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.baulose.ftth);
  }
  async expectLoadedBestandsbau(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        // Checks that the URL is the Baulose Bestandsbau route.
        await expect(this.page).toHaveURL(/\/door2door#\/baulose\/bestandsbau/);
        // "Importdatum" is a column only Bestandsbau's table has — waiting for it confirms
        // the Bestandsbau-specific table has actually rendered, not just that the URL
        // changed. Without this, stale FTTH rows could still be showing (and coincidentally
        // match whatever filter was just applied) for a moment after navigating here.
        await expect(this.page.getByRole('cell', { name: 'Importdatum' })).toBeVisible();
      },
      () => this.navigation.goToObjekte(),
      async () => {
        await this.navigation.goToBaulose();
        await this.bestandsbauTab.click();
      },
    );
  }
  async expectLoadedFTTH(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        // Checks that the URL is the Baulose FTTH route.
        await expect(this.page).toHaveURL(/\/door2door#\/baulose\/ftth/);
        // "Baulose / Regime" is a column only FTTH's table has — same reasoning as above,
        // for the opposite direction (stale Bestandsbau rows after navigating to FTTH).
        await expect(this.page.getByRole('cell', { name: 'Baulos / Regime' })).toBeVisible();
      },
      () => this.navigation.goToObjekte(),
      async () => {
        await this.navigation.goToBaulose();
        await this.ftthTab.click();
      },
    );
  }

  // Searches the Baulose list.
  async searchByPressingEnter(text: string): Promise<void> {
    // Fills the Baulose search input.
    await this.searchField.triggerSearchByPressingEnter(text);
    // Presses Enter to submit/apply the search.
  }
  async searchByClickingSearchButton(text: string): Promise<void> {
    // Fills the Baulose search input.
    await this.searchField.triggerSearchByClickingSearchButton(text);
    // Clicks the search button to submit/apply the search.
  }

  // Clears the Baulose search input.
  async cleanSearchInput(): Promise<void> {
    await this.cleanSearchInputButton.click();
  }

  // Opens the Organisation filter on Baulose. Uses the stable id-based trigger, not
  // visible-name matching — the trigger's accessible name grows a "(N)" suffix once a
  // choice is applied (e.g. "Organisation" -> "Organisation (1)"), which would break a
  // name-based locator on any reopen after the first use.
  async openOrganisationFilter(): Promise<void> {
    await this.filters.organisationFilterOpen();
    await this.filters.expectDropdownOpened();
  }

  // Opens the Regime filter on Baulose. Same stable-id reasoning as openOrganisationFilter.
  async openRegimeFilter(): Promise<void> {
    await this.filters.regimeFilterOpen();
    await this.filters.expectDropdownOpened();
  }

  // Opens the Phase filter on Baulose. Same stable-id reasoning as openOrganisationFilter.
  async openPhaseFilter(): Promise<void> {
    await this.filters.phaseFilterOpen();
    await this.filters.expectDropdownOpened();
  }

  // Opens the Status filter on Baulose. Same stable-id reasoning as openOrganisationFilter.
  async openStatusFilter(): Promise<void> {
    await this.filters.statusFilterOpen();
    await this.filters.expectDropdownOpened();
  }

  // Opens the Importdatum filter bar button on Baulose. Same stable-id reasoning as
  // openOrganisationFilter.
  async openImportDateFilter(): Promise<void> {
    await this.filters.importDateFilterOpen();
  }
  async expectEveryRowHasSalesActionNavigationButton(): Promise<void> {
    const rowCount = await this.table.rows.count();
    for (let i = 0; i < rowCount; i++) {
      await expect(this.table.rows.nth(i).getByRole('button', { name: /zu Sales Actions/i })).toBeVisible();
    };
  }
  salesActionButtonFor(displayName: string): Locator {
    return this.table.rowByText(displayName).getByRole('button', { name: /zu Sales Actions/i });
  }
 
}
