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
  readonly genericDropdownMenuOption : Locator;
  constructor(page: Page) {
    super(page);
    this.navigation = new AppNavigation(page);
    this.filters = new FilterBar(page);
    this.modal = new ModalDialog(page);
    this.neubauSidePanel = new SidePanel(page, 'neubau-object-side-panel', page.locator('#neubau-object-side-panel-close-button'));
    this.ftthSidePanel = new SidePanel(page, 'ftth-object-side-panel', page.locator('#ftth-object-side-panel-close-button'));
    this.bestandsbauSidePanel = new SidePanel(page, 'bestandsbau-object-side-panel', page.locator('#bestandsbau-object-side-panel-close-button'));
    this.table = new TableView(page);
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
    
  }
  async openPhaseFilterDropDown(): Promise<void> {
    await this.phaseFilter.click();
  }
  
  async expectAblegerErfasstChipInSidePanelVisible(): Promise<void> {
    await expect(this.ablegerErfasstChipInSidePanel).toBeVisible();
  }
  phaseChipInSidePanelHeader(phaseValue: string): Locator {
    return this.page.locator('#ftth-object-side-panel')
      .locator('div.te1qfalAqINSiWe6H_Bs')
      .getByText(phaseValue, { exact: true });
  }
  async expectPhaseChipInSidePanelHeaderToBe(phaseValue: string): Promise<void> {
    await expect(this.phaseChipInSidePanelHeader(phaseValue)).toBeVisible();
  }
  async expectAblegerZustimmungChipColour(expectedStatus: keyof typeof SIDE_PANEL_CHIP_COLORS): Promise<void> {
    const chipValue = this.page.locator('#ftth-object-side-panel')
      .getByText('Ableger Zustimmung', { exact: true })
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
  async openFirstItemSidePanel(): Promise<void> {
    // Clicks the first row in the Sales Actions table.
    await this.table.rows.first().click();
  }
  async expectNeubauSalesActionSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/neubau\/\d+/);
    await expect(this.neubauSidePanel.root).toBeVisible();
  }
  async expectFtthSalesActionSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/ftth\/\d+/);
    await expect(this.ftthSidePanel.root).toBeVisible();
  }
  async expectBestandsbauSalesActionSidePanelOpen(): Promise<void> {
    await expect(this.page).toHaveURL(/\/door2door#\/sales-actions\/bestandsbau\/\d+/);
    await expect(this.bestandsbauSidePanel.root).toBeVisible();
  }
  async expectAblegerZustimmungFilterDisplayed(): Promise<void> {
    await expect(this.ablegerZustimmungFilter).toBeVisible();
  }
  async openAblegerZustimmungFilterDropDown(): Promise<void> {
    await this.ablegerZustimmungFilter.click();
  }
  async expectAblegerAbgelehntFilterOptionDisplayed(filterOption: string | RegExp): Promise<void> {
    await expect(this.genericDropdownMenuOption.getByText(filterOption,{exact: true})).toBeVisible();
  }
  async selectAblegerAbgelehntOptionAndApplyFilter(filterOption: string | RegExp): Promise<void> {
    await this.genericDropdownMenuOption.getByText(filterOption,{exact: true}).click();
    // Assuming there's an "Apply" button in the filter modal
    await this.filters.applyFilter();
  }
  async openFirstCustomerInteractionAccordion(): Promise<void> {
    await this.customerInteractionAccordion.first().click();
  }
}
