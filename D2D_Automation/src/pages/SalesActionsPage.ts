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
import { ablegerZustimmungOptions, ablegerZustimmungsdokumentOptions } from '../constants/salesActionFiltersValues';
import { nearestNonTransparentBackgroundColor } from '../helpers/filterAssertions';
import { SIDE_PANEL_CHIP_COLORS } from '../constants/salesActionSidePanelChipColors';


// Represents the Sales Actions main page.
export class SalesActionsPage extends BasePage {
  // Shared top navigation helper.
  readonly navigation: AppNavigation;
  // Shared filter bar helper.
  readonly filters: FilterBar;
  // Shared modal helper for Alle Filter and other dialogs.
  readonly modal: ModalDialog;
  // Shared side panel helper for Sales Action details; update its root when stable DOM attributes exist.
  readonly ftthSidePanel: SidePanel;
  readonly neubauSidePanel: SidePanel;
  readonly bestandsbauSidePanel: SidePanel
  // Shared table/list helper.
  readonly table: TableView;
  readonly listRows: Locator;
  readonly firstRow: Locator;
  readonly baulosEinsatznameContents: Locator;
  readonly firstRowBaulosEinsatznameContent: Locator;
  readonly baulosEinsatznameSearchInput: Locator;
  // Locator for the Sales Actions search input.
  readonly searchInput: Locator;
  // Locator for the Neubau tab.
  readonly neubauTab: Locator;
  // Locator for the FTTH tab.
  readonly ftthTab: Locator;
  // Locator for the Bestandsbau tab.
  readonly bestandsbauTab: Locator;
  // Locator for Neubau List view
  readonly neubauListView: Locator;
  // Locator for FTTH List view
  readonly ftthAusbauListView: Locator;
  // Locator for Bestandsbau List view
  readonly bestandsbauTabListView: Locator;

  // Filter trigger locators — confirmed live 2026-08-28 (see reference-sales-actions-filters
  // memory). Organisation isn't duplicated here — it's the same #organizations id already
  // shared via FilterBar.organisationFilter, so use this.filters.organisationFilter instead.
  readonly baulosEinsatznameFilter: Locator;
  readonly regimeFilter: Locator;
  readonly phaseFilter: Locator;
  readonly terminFilter: Locator;
  readonly immobilienartFilter: Locator;
  readonly statusFilter: Locator;
  readonly aufgabeFilter: Locator;
  readonly ergebnisFilter: Locator;
  readonly planskizzeFilter: Locator;
  readonly bestellungUeberD2DFilter: Locator;
  readonly ablegerZustimmungFilter: Locator;
  readonly kundendatenFilter: Locator;
  readonly salesActionTypeFilter: Locator;
  readonly objektFilter: Locator;
  readonly zugewiesenAnFilter: Locator;
  readonly upsellingPotentialFilter: Locator;
  readonly ablegerAbgelehnt: Locator;
  readonly ablegerZugestimmt: Locator;
  readonly ablegerZustimmungsdokumentErfasst: Locator;
  readonly ablegerZustimmungsdokumentNichtErfasst: Locator;
  readonly aktvititenSidePanelSection: Locator;
  readonly ubersichtSidePanelSection: Locator;
  readonly dokumenteSidePanelSection: Locator;
  readonly bestellscheinSidePanelSection: Locator;
  readonly customerInteractionAccordion: Locator;
  readonly accordionBodyContent: Locator;
  readonly customerInteractionAccordionBodyState: Locator;
  readonly ablegerErfasstChipInSidePanel: Locator;
  readonly bestellungUberStatusInSAPanel: Locator
  readonly planskizzeStatusInSAPanel: Locator
  readonly genericDropdownMenuOption: Locator;
  constructor(page: Page) {
    super(page);
    this.navigation = new AppNavigation(page);
    this.filters = new FilterBar(page);
    this.modal = new ModalDialog(page);
    this.neubauSidePanel = new SidePanel(page, 'neubau-object-side-panel', page.locator('#neubau-object-side-panel-close-button'));
    this.ftthSidePanel = new SidePanel(page, 'ftth-object-side-panel', page.locator('#ftth-object-side-panel-close-button'));
    this.bestandsbauSidePanel = new SidePanel(page, 'bestandsbau-object-side-panel', page.locator('#bestandsbau-object-side-panel-close-button'));
    // Confirmed 2026-09-16: every Sales Actions table root carries a "..._SA_Table" class
    // (Bestandsbau_SA_Table/FTTH_SA_Table/Neubau_SA_Table) — tighter and far less
    // collision-prone than TableView's generic [class*="Table"] fallback, so every check
    // built on this.table (rows, loadingCells, empty-state) inherits the safer scoping.
    this.table = new TableView(page, page.locator('[class*="_SA_Table"]'));
    this.listRows = page.locator('tr[id^="sales-action-row-"]');
    this.firstRow = this.listRows.first();
    this.baulosEinsatznameContents = this.listRows.locator('div[id$="-main-info"]');
    this.firstRowBaulosEinsatznameContent = this.firstRow.locator('div[id$="-main-info"]');
    this.baulosEinsatznameSearchInput = this.filters.dropdownRoot.getByRole('textbox', { name: /Baulos\/Einsatzname/ });
    this.searchInput = page.locator('#sales-actions-search-field');
    this.neubauTab = page.getByRole('link', { name: /Neubau/i }).or(page.getByRole('tab', { name: /Neubau/i }));
    this.ftthTab = page.getByRole('link', { name: /FTTH/i }).or(page.getByRole('tab', { name: /FTTH/i }));
    this.bestandsbauTab = page.getByRole('link', { name: /Bestandsbau/i }).or(
      page.getByRole('tab', { name: /Bestandsbau/i }),
    );
    this.neubauListView = page.getByRole(`table`)
    this.ftthAusbauListView = page.getByRole(`table`)
    this.bestandsbauTabListView = page.getByRole(`table`)
    this.baulosEinsatznameFilter = page.locator('#contractSection');
    this.regimeFilter = page.locator('#salesActionObjectSubType');
    this.phaseFilter = page.locator('#contractSectionPhaseAdmins');
    this.terminFilter = page.locator('#appointment');
    this.immobilienartFilter = page.locator('#salesActionPropertyType');
    this.statusFilter = page.locator('#salesActionStatus');
    this.aufgabeFilter = page.locator('#salesActionTasks');
    this.ergebnisFilter = page.locator('#salesActionInteractionResults');
    this.planskizzeFilter = page.locator('#netDocument');
    this.bestellungUeberD2DFilter = page.locator('#hybrisOrder');
    this.ablegerZustimmungFilter = page.locator('#zustNetdocDocument');
    this.genericDropdownMenuOption = page.locator('#filter-dropdown-root');
    this.kundendatenFilter = page.locator('#customerData');
    this.salesActionTypeFilter = page.locator('#salesActionType');
    this.objektFilter = page.locator('#salesActionLocationResults');
    this.zugewiesenAnFilter = page.locator('#salesActionsAssigneesSearch');
    this.upsellingPotentialFilter = page.locator('#upsellingPotential');
    this.ablegerAbgelehnt = page.locator('#filter-dropdown-root').getByText(ablegerZustimmungOptions.ablegerAbgelehnt);
    this.ablegerZugestimmt = page.locator('#filter-dropdown-root').getByText(ablegerZustimmungOptions.ablegerZugestimmt);
    this.ablegerZustimmungsdokumentErfasst = page.locator('#filter-dropdown-root').getByText(ablegerZustimmungsdokumentOptions.erfasst);
    this.ablegerZustimmungsdokumentNichtErfasst = page.locator('#filter-dropdown-root').getByText(ablegerZustimmungsdokumentOptions.nichtErfasst);
    this.aktvititenSidePanelSection = page.getByRole('link', { name: /^Aktivitäten/i });
    this.ubersichtSidePanelSection = page.getByRole('link', { name: /^ÜBERSICHT/i });
    this.dokumenteSidePanelSection = page.getByRole('link', { name: /^DOKUMENTE/i });
    this.bestellscheinSidePanelSection = page.getByRole('link', { name: /^BESTELLSTATUS/i });
    this.customerInteractionAccordion = page.locator('div[class="gucci-common-accordion"]').locator('[id^="accordion-header-customer-interaction-"]')
    this.accordionBodyContent = page.locator('div[class*="gucci-common-accordion"]');
    this.customerInteractionAccordionBodyState = page.locator('div[class="gucci-common-accordion"]').locator('[class^="gucci-common-accordion-body"]');
    this.ablegerErfasstChipInSidePanel = page.locator('#ftth-object-side-panel').getByText('Ableger Zustimmung', { exact: true });
    this.bestellungUberStatusInSAPanel = page.locator('#ftth-object-side-panel').getByText('Bestellung über D2D', { exact: true });
    // "Planskizze" text appears twice in the side panel — once as the action-bar quick-link
    // button, once as this info-section field label. The info-section one always renders
    // after the button in DOM order (confirmed live 2026-09-16), so .last() reliably picks it.
    this.planskizzeStatusInSAPanel = page.locator('#ftth-object-side-panel').getByText('Planskizze', { exact: true }).last();

  }
  async openBaulosEinsatznameFilterDropDown(): Promise<void> {
    await this.baulosEinsatznameFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openOrganisationFilterDropDown(): Promise<void> {
    await this.filters.organisationFilterOpen();
    await this.filters.expectDropdownOpened();
  }
  async openRegimeFilterDropDown(): Promise<void> {
    await this.regimeFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openPhaseFilterDropDown(): Promise<void> {
    await this.phaseFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openTerminFilterDropDown(): Promise<void> {
    await this.terminFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openImmobilienartFilterDropDown(): Promise<void> {
    await this.immobilienartFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openStatusFilterDropDown(): Promise<void> {
    await this.statusFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openAufgabeFilterDropDown(): Promise<void> {
    await this.aufgabeFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openErgebnisFilterDropDown(): Promise<void> {
    await this.ergebnisFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openPlanskizzeFilterDropDown(): Promise<void> {
    await this.planskizzeFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openBestellungUeberD2DFilterDropDown(): Promise<void> {
    await this.bestellungUeberD2DFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openKundendatenFilterDropDown(): Promise<void> {
    await this.kundendatenFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openSalesActionTypeFilterDropDown(): Promise<void> {
    await this.salesActionTypeFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openObjektFilterDropDown(): Promise<void> {
    await this.objektFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openZugewiesenAnFilterDropDown(): Promise<void> {
    await this.zugewiesenAnFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async openUpsellingPotentialFilterDropDown(): Promise<void> {
    await this.upsellingPotentialFilter.click();
    await this.filters.expectDropdownOpened();
  }

  async expectAblegerErfasstChipInSidePanelVisible(): Promise<void> {
    await expect(this.ablegerErfasstChipInSidePanel).toBeVisible();
  }
  async checkBestellungUeberD2DStatusInSidePanel(expectedStatus: string | RegExp): Promise<void> {
    await expect(this.bestellungUberStatusInSAPanel.locator('..').getByText(expectedStatus, { exact: true })).toBeVisible();
  }
  async checkPlanskizzeStatusInSidePanel(expectedStatus: string | RegExp): Promise<void> {
    await expect(this.planskizzeStatusInSAPanel.locator('..').getByText(expectedStatus, { exact: true })).toBeVisible();
  }
  async expectPlanskizzeStatusChipColourToBe(expectedStatus: keyof typeof SIDE_PANEL_CHIP_COLORS): Promise<void> {
    const chipValue = this.planskizzeStatusInSAPanel.locator('xpath=following-sibling::*[1]').getByText(expectedStatus, { exact: true });
    const backgroundColor = await nearestNonTransparentBackgroundColor(chipValue);
    expect(backgroundColor).toBe(SIDE_PANEL_CHIP_COLORS[expectedStatus]);
  }
  phaseChipInSidePanelHeader(phaseValue: string): Locator {
    return this.page.locator('#ftth-object-side-panel')
      .locator('div.te1qfalAqINSiWe6H_Bs')
      .getByText(phaseValue, { exact: true });
  }
  async expectPhaseChipInSidePanelHeaderToBe(phaseValue: string): Promise<void> {
    await expect(this.phaseChipInSidePanelHeader(phaseValue)).toBeVisible();
  }
  async expectPhaseChipInSidePanelHeaderColourToBe(phaseValue: keyof typeof SIDE_PANEL_CHIP_COLORS): Promise<void> {
    const backgroundColor = await nearestNonTransparentBackgroundColor(this.phaseChipInSidePanelHeader(phaseValue));
    expect(backgroundColor).toBe(SIDE_PANEL_CHIP_COLORS[phaseValue]);
  }
  async expectAblegerZustimmungChipColour(expectedStatus: keyof typeof SIDE_PANEL_CHIP_COLORS): Promise<void> {
    const chipValue = this.page.locator('#ftth-object-side-panel')
      .getByText('Ableger Zustimmung', { exact: true })
      .locator('xpath=following-sibling::*[1]')
      .getByText(expectedStatus, { exact: true });
    const backgroundColor = await nearestNonTransparentBackgroundColor(chipValue);
    expect(backgroundColor).toBe(SIDE_PANEL_CHIP_COLORS[expectedStatus]);
  }
  async expectBestellungUeberD2DStatusChipColour(expectedStatus: keyof typeof SIDE_PANEL_CHIP_COLORS): Promise<void> {
    const chipValue = this.page.locator('#ftth-object-side-panel')
      .getByText('Bestellung über D2D', { exact: true })
      .locator('xpath=following-sibling::*[1]')
      .getByText(expectedStatus, { exact: true });
    const backgroundColor = await nearestNonTransparentBackgroundColor(chipValue);
    expect(backgroundColor).toBe(SIDE_PANEL_CHIP_COLORS[expectedStatus]);
  }

  async expectCustomerInteractionAccordionOpened(): Promise<void> {
    await expect(this.customerInteractionAccordionBodyState.first()).toHaveClass("gucci-common-accordion-body open");
    await expect(this.accordionBodyContent.getByText('Notiz:', { exact: true }).first()).toBeVisible();
    await expect(this.accordionBodyContent.getByText('durchgeführt von:', { exact: true }).first()).toBeVisible();

  }
  // Confirmed live DOM 2026-09-16: the "Termin DD.MM.YYYY HH:MM - HH:MM" badge (plus its
  // stattgefunden/nicht stattgefunden/verschoben status) renders in the accordion header
  // itself - no click/expand needed. Confirmed 1:1 with the user: an entry with no Termin
  // omits this badge entirely (no empty placeholder), and "Termin" doesn't appear anywhere
  // else in this tab, so this text match is a safe, direct proof either way.
  async expectAktivitatenHasAtLeastOneTermin(): Promise<void> {
    await expect(
      this.accordionBodyContent.getByText(/^Termin \d{2}\.\d{2}\.\d{4} \d{2}:\d{2} - \d{2}:\d{2}/).first()
    ).toBeVisible();
  }
  // Inverse of the above, same confirmed 1:1 correspondence — for "ohne Termin".
  async expectAktivitatenHasNoTermin(): Promise<void> {
    await expect(
      this.accordionBodyContent.getByText(/^Termin \d{2}\.\d{2}\.\d{4} \d{2}:\d{2} - \d{2}:\d{2}/)
    ).toHaveCount(0);
  }
  async openUbersichtSidePanelSection(): Promise<void> {
    await this.ubersichtSidePanelSection.click();
  }
  async openAktivitenSidePanelSection(): Promise<void> {
    await this.aktvititenSidePanelSection.click();
  }
  async openDokumenteSidePanelSection(): Promise<void> {
    await this.dokumenteSidePanelSection.click();
  }
  async openBestellscheinSidePanelSection(): Promise<void> {
    await this.bestellscheinSidePanelSection.click();
  }
  // Opens the bare Sales Actions route — the real app auto-redirects this to Neubau.
  async goToSalesActionPage(): Promise<void> {
    await this.gotoDoor2DoorRoute(door2doorRoutes.salesActions.main);
  }

  // Verifies the bare Sales Actions route loaded and redirected to Neubau as expected.
  async expectLoadedSalesAction(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/neubau/);
        await expect(this.searchInput).toBeVisible();
        // Confirmed real DOM: this is a floating <label>, not a placeholder attribute.
        await this.expectSearchFieldPlaceholderVisible(this.searchInput, /Suche in Sales Actions/i);
      },
      () => this.navigation.goToBaulose(),
      async () => {
        await this.navigation.goToSalesActions();
        await this.neubauTab.click();
      },
    );
  }

  // Opens the Sales Actions Neubau route directly.
  async gotoNeubauSalesAction(): Promise<void> {
    // Navigates to the confirmed Sales Actions route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.salesActions.neubau);
  }
  async gotoFtthSalesAction(): Promise<void> {
    // Navigates to the confirmed Sales Actions route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.salesActions.ftth);
  }
  async gotoBestandsbauSalesAction(): Promise<void> {
    // Navigates to the confirmed Sales Actions route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.salesActions.bestandsbau);
  }

  // Verifies the Sales Actions Neubau section loaded.
  async expectLoadedNeubau(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        // Checks that the URL is the Sales Actions Neubau route.
        await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/neubau/);
        // Checks that the Sales Actions search field is visible.
        await expect(this.searchInput).toBeVisible();
      },
      () => this.navigation.goToBaulose(),
      async () => {
        await this.navigation.goToSalesActions();
        await this.neubauTab.click();
      },
    );
  }

  // Verifies the Sales Actions FTTH section loaded.
  async expectLoadedFTTH(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        // Checks that the URL is the Sales Actions FTTH route.
        await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/ftth/);
        // Checks that the Sales Actions search field is visible.
        await expect(this.searchInput).toBeVisible();
      },
      () => this.navigation.goToBaulose(),
      async () => {
        await this.navigation.goToSalesActions();
        await this.ftthTab.click();
      },
    );
  }

  // Verifies the Sales Actions Bestandsbau section loaded.
  async expectLoadedBestandsbau(): Promise<void> {
    await this.expectWithRecovery(
      async () => {
        // Checks that the URL is the Sales Actions Bestandsbau route.
        await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/bestandsbau/);
        // Checks that the Sales Actions search field is visible.
        await expect(this.searchInput).toBeVisible();
      },
      () => this.navigation.goToBaulose(),
      async () => {
        await this.navigation.goToSalesActions();
        await this.bestandsbauTab.click();
      },
    );
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
  async openFirstItemSidePanel(): Promise<void> {
    // Clicks the first row in the Sales Actions table.
    await this.table.rows.first().click();
  }
  async expectNeubauSalesActionSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/neubau\/\d+/);
    await expect(this.neubauSidePanel.root).toBeVisible();
    await expect(this.ubersichtSidePanelSection).toBeVisible();

  }
  async expectFtthSalesActionSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/ftth\/\d+/);
    await expect(this.ftthSidePanel.root).toBeVisible();
    await expect(this.ubersichtSidePanelSection).toBeVisible();
  }
  async expectBestandsbauSalesActionSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/bestandsbau\/\d+/);
    await expect(this.bestandsbauSidePanel.root).toBeVisible();
    await expect(this.ubersichtSidePanelSection).toBeVisible();

  }
  async expectAblegerZustimmungFilterDisplayed(): Promise<void> {
    await expect(this.ablegerZustimmungFilter).toBeVisible();
  }
  async openAblegerZustimmungFilterDropDown(): Promise<void> {
    await this.ablegerZustimmungFilter.click();
    await this.filters.expectDropdownOpened();
  }
  async expectAblegerAbgelehntFilterOptionDisplayed(filterOption: string | RegExp): Promise<void> {
    await expect(this.genericDropdownMenuOption.getByText(filterOption, { exact: true })).toBeVisible();
  }
  async selectAblegerAbgelehntOptionAndApplyFilter(filterOption: string | RegExp): Promise<void> {
    await this.genericDropdownMenuOption.getByText(filterOption, { exact: true }).click();
    // Assuming there's an "Apply" button in the filter modal
    await this.filters.applyFilter();
  }
  async openFirstCustomerInteractionAccordion(): Promise<void> {
    await this.customerInteractionAccordion.first().click();
  }
  kundendatenIconInRow(row: Locator): Locator {
    return row.locator('svg path[d^="M11 11a5.332 5.332 0"]');
  }
  upsellingPotentialIconInRow(row: Locator): Locator {
    return row.locator('svg path[d^="M18.286 1.999h-4.572"]');
  }
  notizIconInRow(row: Locator): Locator {
    return row.locator('svg path[d^="M17 0h-2.133v5.333H17V0z"]');
  }
  // Confirmed 2026-09-15: unlike Objekte, Sales Actions has no dedicated Organisation
  // column - the org/team name renders inside the "zugewiesen an" (assigned-to) cell, in
  // its own stable div, alongside content that varies row to row (1-3 assignee name lines
  // above it, an optional "(übergeben)" suffix below it). Scoping directly to this div
  // (a structural class-based locator, unavoidable since no id/data-attribute exists for
  // this specific line) keeps the check correct regardless of that surrounding variation.
  organisationInRow(row: Locator): Locator {
    return row.locator('.CtitwbHLBT1uebUegj6o');
  }

}