// Imports Playwright assertions and types for the Benutzerverwaltung page object.
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

// Represents the Benutzerverwaltung main page.
export class BenutzerverwaltungPage extends BasePage {
  // Shared top navigation helper.
  readonly navigation: AppNavigation;
  // Shared filter bar helper.
  readonly filters: FilterBar;
  // Shared modal helper for create/edit dialogs.
  readonly modal: ModalDialog;
  // Shared side panel helper for user/team/organisation details; update its root when stable DOM attributes exist.
  readonly sidePanel: SidePanel;
  // Shared table/list helper.
  readonly table: TableView;
  // Locator for the Benutzerverwaltung search input.
  readonly searchInput: Locator;
  // Locator for the Benutzer tab.
  readonly usersTab: Locator;
  // Locator for the Teams tab.
  readonly teamsTab: Locator;
  // Locator for the Organisationen tab.
  readonly organisationenTab: Locator;
  // Locator for the Benutzer erstellen action button.
  readonly createUserButton: Locator;
  // Locator for the Team erstellen action button.
  readonly createTeamButton: Locator;
  // Locator for the Admin A1 erstellen action button.
  readonly createAdminA1Button: Locator;

  // Builds the Benutzerverwaltung page object for the active browser page.
  constructor(page: Page) {
    // Passes the Playwright page into BasePage.
    super(page);
    // Creates a helper for top navigation links.
    this.navigation = new AppNavigation(page);
    // Creates a helper for inline filters.
    this.filters = new FilterBar(page);
    // Creates a helper for modal dialogs.
    this.modal = new ModalDialog(page);
    // Creates a helper for the right-side administration detail panel.
    this.sidePanel = new SidePanel(page);
    // Creates a helper for table/list behavior.
    this.table = new TableView(page);
    // Locates the shared search input using known test id/id first, then a generic Suche placeholder fallback.
    this.searchInput = page.locator('[data-testid="shared-search-field"], #shared-search-field, input[placeholder*="Suche"]').first();
    // Locates the Benutzer tab by link role or tab role.
    this.usersTab = page.getByRole('link', { name: /Benutzer/i }).or(page.getByRole('tab', { name: /Benutzer/i }));
    // Locates the Teams tab by link role or tab role.
    this.teamsTab = page.getByRole('link', { name: /Teams/i }).or(page.getByRole('tab', { name: /Teams/i }));
    // Locates the Organisationen tab by link role or tab role.
    this.organisationenTab = page.getByRole('link', { name: /Organisationen/i }).or(
      // Falls back to role=tab if the tab component exposes ARIA tab semantics.
      page.getByRole('tab', { name: /Organisationen/i }),
    );
    // Locates the Benutzer erstellen button by visible text.
    this.createUserButton = page.getByRole('button', { name: /Benutzer erstellen/i });
    // Locates the Team erstellen button by visible text.
    this.createTeamButton = page.getByRole('button', { name: /Team erstellen/i });
    // Locates the Admin A1 erstellen button by visible text.
    this.createAdminA1Button = page.getByRole('button', { name: /Admin A1 erstellen/i });
  }

  // Opens the Benutzerverwaltung users route directly.
  async goto(): Promise<void> {
    // Navigates to the confirmed Benutzerverwaltung route.
    await this.gotoDoor2DoorRoute(door2doorRoutes.benutzerverwaltungUsers);
  }

  // Verifies the Benutzerverwaltung page loaded.
  async expectLoaded(): Promise<void> {
    // Checks that the URL is the Benutzerverwaltung users route.
    await expect(this.page).toHaveURL(/\/door2door#\/benutzerverwaltung\/users/);
    // Checks that the Benutzer tab is visible.
    await expect(this.usersTab).toBeVisible();
  }

  // Searches the Benutzerverwaltung list.
  async search(text: string): Promise<void> {
    // Fills the Benutzerverwaltung search input.
    await this.searchInput.fill(text);
    // Presses Enter to submit/apply the search.
    await this.searchInput.press('Enter');
  }

  // Opens the Team erstellen modal dialog.
  async openCreateTeamDialog(): Promise<void> {
    // Clicks the Team erstellen button.
    await this.createTeamButton.click();
    // Verifies the Team erstellen dialog opened.
    await this.modal.expectOpen(/Team erstellen/i);
  }
}
