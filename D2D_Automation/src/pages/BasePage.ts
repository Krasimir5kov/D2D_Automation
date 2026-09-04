// Imports Playwright assertion support and the Page type used by all page objects.
import { expect, type Locator, type Page } from '@playwright/test';

// Stores the confirmed Door2Door hash routes used by the page objects.
export const door2doorRoutes = {
  baulose: {
    main: '#/baulose',
    ftth: '#/baulose/ftth',
    bestandsbau: '#/baulose/bestandsbau',
  },
  objekte: {
    main: '#/objekte',
    neubau: '#/objekte/neubau',
    ftth: '#/objekte/ftth',
    bestandsbau: '#/objekte/bestandsbau',
  },
  salesActions: {
    main: '#/sales-actions',
    neubau: '#/sales-actions/neubau',
    ftth: '#/sales-actions/ftth',
    bestandsbau: '#/sales-actions/bestandsbau',
  },
  benutzerverwaltung: {
    main: '#/benutzerverwaltung',
    users: '#/benutzerverwaltung/users',
    teams: '#/benutzerverwaltung/teams',
    organisationen: '#/benutzerverwaltung/organisationen',
  },
  importe: '#/importe',
  konfiguration: {
    overview: '#/konfiguration/%C3%BCbersicht',
    abschlussgruende: '#/konfiguration/abschlussgr%C3%BCnde',
    aufgaben: '#/konfiguration/aufgaben',
    gruppen: '#/konfiguration/gruppen',
    regime: '#/konfiguration/regime',
    aktivitaetenSetup: '#/konfiguration/aktivit%C3%A4ten-setup',
  },
} as const;

// Base class shared by all Door2Door page objects.
export abstract class BasePage {
  private errorRecoveryHandlerRegistered = false;

  // Stores the active Playwright page for child page objects.
  protected constructor(protected readonly page: Page) { }
  // Reads INTEGRATION_URL and fails clearly if it is missing.
  protected getRequiredIntegrationUrl(): string {
    // Gets the integration URL from the environment loaded by Playwright config.
    const integrationUrl = process.env.INTEGRATION_URL;

    // Stops the test if the URL is not configured.
    if (!integrationUrl) {
      // Gives the tester the exact missing environment variable.
      throw new Error('Set INTEGRATION_URL in .env before running UI tests.');
    }

    // Returns the configured integration URL for navigation.
    return integrationUrl;
  }
  // Auto-dismisses the "Too Many Requests" / unexpected-error overlay whenever it
  // appears, by clicking its reload button. Registered once per page instance —
  // Playwright then checks for it automatically before every action/assertion,
  // so individual tests never need to handle it themselves.
  private async registerErrorRecoveryHandler(): Promise<void> {
    // Registers the handler only once per page instance.
    if (this.errorRecoveryHandlerRegistered) {
      return;
    }
    this.errorRecoveryHandlerRegistered = true;
    await this.page.addLocatorHandler(
      this.page.getByRole('button', { name: 'Door2Door neu laden' }), async () => {
        // Clicks the reload button to dismiss the overlay and recover from the error.
        await this.page.getByRole('button', { name: 'Door2Door neu laden' }).click();
      }
    );
  }

  // Builds a full Door2Door URL for a provided hash route.
  protected buildDoor2DoorUrl(route: string): string {
    // Gets the configured base integration URL.
    const integrationUrl = this.getRequiredIntegrationUrl();
    // Normalizes the route so callers can pass either "#/x" or "/x".
    const hashRoute = route.startsWith('#') ? route : `#/${route.replace(/^\/+/, '')}`;
    // Finds the /door2door path if the configured URL already includes it.
    const door2doorIndex = integrationUrl.indexOf('/door2door');

    // Handles URLs that already contain /door2door, with or without an existing hash route.
    if (door2doorIndex >= 0) {
      // Keeps the origin and /door2door path, then replaces the hash route.
      return `${integrationUrl.slice(0, door2doorIndex + '/door2door'.length)}${hashRoute}`;
    }

    // Handles URLs that do not include /door2door by appending the hash route to the configured URL.
    return `${integrationUrl.split('#')[0].replace(/\/$/, '')}${hashRoute}`;
  }

  // Opens the configured integration URL exactly as defined in .env.
  async gotoIntegrationUrl(): Promise<void> {
    // Navigates to INTEGRATION_URL and waits until the DOM is available.
    await this.registerErrorRecoveryHandler();
    await this.gotoWithRetry(this.getRequiredIntegrationUrl());
  }

  // Opens a specific Door2Door hash route.
  async gotoDoor2DoorRoute(route: string): Promise<void> {
    // Builds the full URL and navigates to it.
    await this.registerErrorRecoveryHandler();
    await this.gotoWithRetry(this.buildDoor2DoorUrl(route));
  }

  // Retries page.goto() a few times on a transient connection-level failure
  // (connection refused/aborted/reset, or the navigation itself timing out) before
  // giving up — confirmed on CI, where the shared INT environment intermittently
  // refuses/aborts the connection even with a single worker. Anything else (e.g. a
  // real assertion failure later in the test) is unaffected, since this only wraps
  // the goto() call itself.
  private async gotoWithRetry(url: string, attempts = 3, delayMs = 3000): Promise<void> {
    const isRetryableNetworkError = (error: unknown): boolean =>
      error instanceof Error &&
      /ERR_CONNECTION_REFUSED|ERR_ABORTED|ERR_CONNECTION_RESET|ERR_CONNECTION_CLOSED|ERR_EMPTY_RESPONSE|Timeout \d+ms exceeded/.test(
        error.message,
      );

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        return;
      } catch (error) {
        if (attempt === attempts || !isRetryableNetworkError(error)) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // Asserts the "floating label" text shown next to a search input is visible with the
  // expected wording. This is NOT a native placeholder attribute — every search field in
  // this app renders <label for="{input-id}"><span>{text}</span></label> as a sibling of
  // the <input>, inside a shared "flexed-container" wrapper, e.g.:
  //   <div class="flexed-container primary">
  //     <label for="sales-actions-search-field"><span>Suche in Sales Actions...</span></label>
  //     <input id="sales-actions-search-field" .../>
  //     <button class="search-button icon-a1-lupe" .../>
  //   </div>
  // So this climbs from the input to that shared wrapper and looks for the label text
  // there, rather than asserting a placeholder attribute that doesn't actually exist.
  async expectSearchFieldPlaceholderVisible(searchInput: Locator, expectedText: string | RegExp): Promise<void> {
    await expect(searchInput.locator('..').getByText(expectedText)).toBeVisible();
  }

  // Verifies that the browser is on a Door2Door hash route.
  async expectDoor2DoorMounted(): Promise<void> {
    // Checks that the current URL contains /door2door#/ which indicates the SPA route is mounted.
    await expect(this.page).toHaveURL(/\/door2door#\//);
  }

  // Runs a check, and if it fails, bounces to another page and back before retrying it
  // once — the same recovery motion confirmed to unstick a section that's stuck loading,
  // without a hard reload that would reset already-applied filters. navigateAway/
  // navigateBack must be in-app UI clicks (nav links, tabs), never a page.goto()-based
  // method, or this defeats the point.
  protected async expectWithRecovery(
    check: () => Promise<void>,
    navigateAway: () => Promise<void>,
    navigateBack: () => Promise<void>,
  ): Promise<void> {
    try {
      await check();
    } catch {
      await navigateAway();
      await navigateBack();
      await check();
    }
  }
}
