// Imports Playwright assertion support and the Page/Locator types used by this POM component.
import { expect, type Locator, type Page } from '@playwright/test';

// Represents the top Door2Door application navigation/header links.
export class AppNavigation {
  readonly bauloseLink: Locator;
  readonly objekteLink: Locator;
  readonly salesActionsLink: Locator;
  readonly benutzerverwaltungLink: Locator;
  readonly importeLink: Locator;
  readonly konfigurationLink: Locator;
  // Stores the active Playwright page so every navigation locator can be created from the same browser page.
  constructor(private readonly page: Page) {
    this.bauloseLink = page.getByRole('link', { name: /Baulose/i });
    this.objekteLink = page.getByRole('link', { name: /Objekte/i });
    this.salesActionsLink = page.getByRole('link', { name: /Sales Action/i });
    this.benutzerverwaltungLink = page.getByRole('link', { name: /Benutzerverwaltung/i });
    this.importeLink = page.getByRole('link', { name: /Importe/i });
    this.konfigurationLink = page.getByRole('link', { name: /Konfiguration/i });
  }
  
  // Verifies that the core navigation links are visible after the app loads.
  async expectVisible(): Promise<void> {
    // Confirms the authenticated user can see the Baulose area.
    await expect(this.bauloseLink).toBeVisible();
    // Confirms the authenticated user can see the Objekte area.
    await expect(this.objekteLink).toBeVisible();
    // Confirms the authenticated user can see the Sales Action area.
    await expect(this.salesActionsLink).toBeVisible();
  }

  // Navigates to the Baulose page through the top navigation.
  async goToBaulose(): Promise<void> {
    // Clicks the Baulose header link.
    await this.bauloseLink.click();
  }

  // Navigates to the Objekte page through the top navigation.
  async goToObjekte(): Promise<void> {
    // Clicks the Objekte header link.
    await this.objekteLink.click();
  }

  // Navigates to the Sales Action page through the top navigation.
  async goToSalesActions(): Promise<void> {
    // Clicks the Sales Action header link.
    await this.salesActionsLink.click();
  }

  // Navigates to the Benutzerverwaltung page through the top navigation.
  async goToBenutzerverwaltung(): Promise<void> {
    // Clicks the Benutzerverwaltung header link.
    await this.benutzerverwaltungLink.click();
  }

  // Navigates to the Importe page through the top navigation.
  async goToImporte(): Promise<void> {
    // Clicks the Importe header link.
    await this.importeLink.click();
  }

  // Navigates to the Konfiguration page through the top navigation.
  async goToKonfiguration(): Promise<void> {
    // Clicks the Konfiguration header link.
    await this.konfigurationLink.click();
  }
}
