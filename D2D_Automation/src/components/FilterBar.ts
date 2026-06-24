// Imports the Playwright Locator and Page types used by this POM component.
import { type Locator, type Page } from '@playwright/test';

// Represents the filter controls shown above Door2Door list/table pages.
export class FilterBar {
  // Stores the active Playwright page so filter locators can be created from it.
  constructor(private readonly page: Page) {}

  // Returns a filter trigger button by visible name; this depends on current DOM text until stable attributes exist.
  filterButton(name: string | RegExp): Locator {
    // Locates a role=button control whose accessible name matches the provided string or regex.
    return this.page.getByRole('button', { name });
  }

  // Returns the "alle Filter" button that opens the full Alle Filter modal.
  get allFiltersButtonViaAlleFilterModal(): Locator {
    // Locates the filter trigger by visible text; replace with data-testid when developers add one.
    return this.filterButton(/alle filter/i);
  }

  // Opens one named filter dropdown from the inline filter bar.
  async openFilter(name: string | RegExp): Promise<void> {
    // Clicks the filter trigger found by visible name.
    await this.filterButton(name).click();
  }

  // Opens the full Alle Filter modal from the filter bar.
  async openAllFiltersInAlleFilterModal(): Promise<void> {
    // Clicks the "alle Filter" trigger.
    await this.allFiltersButtonViaAlleFilterModal.click();
  }
}
