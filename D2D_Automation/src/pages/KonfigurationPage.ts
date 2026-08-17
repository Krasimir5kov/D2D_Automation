// Imports Playwright assertions and types for the Konfiguration page object.
import { expect, type Locator, type Page } from '@playwright/test';
// Imports the shared top navigation helper.
import { AppNavigation } from '../components/AppNavigation';
// Imports the shared modal helper.
import { ModalDialog } from '../components/ModalDialog';
// Imports the shared table helper.
import { TableView } from '../components/TableView';
// Imports shared page behavior and known Door2Door routes.
import { BasePage, door2doorRoutes } from './BasePage';

// Represents the Konfiguration main page and its vertical sub-navigation.
export class KonfigurationPage extends BasePage {
  // Shared top navigation helper.
  readonly navigation: AppNavigation;
  // Shared modal helper for configuration create/edit dialogs.
  readonly modal: ModalDialog;
  // Shared table/list helper.
  readonly table: TableView;
  // Locator for the Uebersicht/Overview configuration nav item.
  readonly overviewNav: Locator;
  // Locator for the Abschlussgruende configuration nav item.
  readonly abschlussgruendeNav: Locator;
  // Locator for the Aufgaben configuration nav item.
  readonly aufgabenNav: Locator;
  // Locator for the Gruppen configuration nav item.
  readonly gruppenNav: Locator;
  // Locator for the Regime configuration nav item.
  readonly regimeNav: Locator;
  // Locator for the Aktivitaeten Setup configuration nav item.
  readonly aktivitaetenSetupNav: Locator;
  // Locator for the Aufgaben search input.
  readonly aufgabenSearchInput: Locator;
  // Locator for the Regime search input.
  readonly regimeSearchInput: Locator;
  // Locator for the Abschlussgruende search input.
  readonly abschlussgruendeSearchInput: Locator;

  // Builds the Konfiguration page object for the active browser page.
  constructor(page: Page) {
    // Passes the Playwright page into BasePage.
    super(page);
    // Creates a helper for top navigation links.
    this.navigation = new AppNavigation(page);
    // Creates a helper for modal dialogs.
    this.modal = new ModalDialog(page);
    // Creates a helper for table/list behavior.
    this.table = new TableView(page);
    // Locates the overview navigation item; includes ascii/umlaut spellings.
    this.overviewNav = page.getByRole('link', { name: /uebersicht|\u00fcbersicht/i });
    // Locates the Abschlussgruende navigation item; includes ascii/umlaut spellings.
    this.abschlussgruendeNav = page.getByRole('link', { name: /abschlussgruende|abschlussgr\u00fcnde/i });
    // Locates the Aufgaben navigation item.
    this.aufgabenNav = page.getByRole('link', { name: /aufgaben/i });
    // Locates the Gruppen navigation item.
    this.gruppenNav = page.getByRole('link', { name: /gruppen/i });
    // Locates the Regime navigation item.
    this.regimeNav = page.getByRole('link', { name: /regime/i });
    // Locates the Aktivitaeten Setup navigation item; includes space/hyphen and ascii/umlaut spellings.
    this.aktivitaetenSetupNav = page.getByRole('link', {
      // Matches several possible renderings because the exact current label/encoding can vary.
      name: /aktivitaeten setup|aktivit\u00e4ten setup|aktivitaeten-setup|aktivit\u00e4ten-setup/i,
    });
    // Locates the Aufgaben search field by documented placeholder.
    this.aufgabenSearchInput = page.getByPlaceholder(/Suche in Aufgaben/i);
    // Locates the Regime search field by documented placeholder.
    this.regimeSearchInput = page.getByPlaceholder(/Suche in Regime/i);
    // Locates the Abschlussgruende search field by documented placeholder.
    this.abschlussgruendeSearchInput = page.getByPlaceholder(/Suche in Abschluss/i);
  }

  // Opens the Konfiguration overview route directly.
  async goto(): Promise<void> {
    // Navigates to the confirmed Konfiguration overview route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.konfiguration.overview);
  }

  // Verifies the Konfiguration page loaded.
  async expectLoaded(): Promise<void> {
    // Checks that the URL is in the Konfiguration route area.
    await expect(this.page).toHaveURL(/\/door2door#\/konfiguration\//);
    // Checks that the overview navigation item is visible.
    await expect(this.overviewNav).toBeVisible();
  }

  // Opens the Aufgaben configuration section.
  async openAufgaben(): Promise<void> {
    // Clicks the Aufgaben nav item.
    await this.aufgabenNav.click();
  }

  // Opens the Regime configuration section.
  async openRegime(): Promise<void> {
    // Clicks the Regime nav item.
    await this.regimeNav.click();
  }

  // Opens the Abschlussgruende configuration section.
  async openAbschlussgruende(): Promise<void> {
    // Clicks the Abschlussgruende nav item.
    await this.abschlussgruendeNav.click();
  }
}
