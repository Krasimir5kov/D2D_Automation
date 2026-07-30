// Imports the Playwright Locator and Page types used by this POM component.
import { type Locator, type Page } from '@playwright/test';

// Represents the filter controls shown above Door2Door list/table pages.
export class FilterBar {
  readonly allFiltersButtonViaAlleFilterModal: Locator;
  readonly applyButton: Locator;
  readonly resetButton : Locator;
  readonly resetAllButton: Locator;
  readonly organisationFilter: Locator;
  readonly regimeFilter: Locator;
  readonly phaseFilter: Locator;
  readonly statusFilter: Locator;
  // Stores the active Playwright page so filter locators can be created from it.
  constructor(private readonly page: Page) {
    this.allFiltersButtonViaAlleFilterModal = page.getByRole('button', { name: /alle filter/i });
    this.applyButton = page.getByRole('button' , {name : 'Anwenden' , exact : true});
    this.resetButton = page.getByRole('button' , {name : 'Zurücksetzen' , exact : true});
    this.resetAllButton = page.getByRole('button' , {name : 'Alle zurücksetzen' , exact : true});
    this.organisationFilter = page.locator('#organisation' , { hasText: 'Organisation' });
    this.regimeFilter = page.locator('#regime' , { hasText: 'Regime' });
    this.phaseFilter = page.locator('#phase' , { hasText: 'Phase' });
    this.statusFilter = page.locator('#status' , { hasText: 'Status' });
  }

  trigger(filterId: string): Locator {
  return this.page.locator(`#${filterId}`);
}
  // Returns a filter trigger button by visible name; this depends on current DOM text until stable attributes exist.
  filterButton(name: string | RegExp): Locator {
    // Locates a role=button control whose accessible name matches the provided string or regex.
    return this.page.getByRole('button', { name });
  }
  async applyFilter(): Promise<void> {
    await this.applyButton.click();
  }
  async resetFilter(): Promise<void> {
    await this.resetButton.click();
  }
  async resetAllFilters(): Promise<void> {
    await this.resetAllButton.click();
  }
  // Returns the "alle Filter" button that opens the full Alle Filter modal.
  // get allFiltersButtonViaAlleFilterModal(): Locator {
  //   // Locates the filter trigger by visible text; replace with data-testid when developers add one.
  //   return this.filterButton(/alle filter/i);
  // }

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
