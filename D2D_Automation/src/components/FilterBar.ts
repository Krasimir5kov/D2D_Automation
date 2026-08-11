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
  readonly importDateFilter: Locator;

  // Stores the active Playwright page so filter locators can be created from it.
  constructor(private readonly page: Page) {
    this.allFiltersButtonViaAlleFilterModal = page.getByRole('button', { name: /alle filter/i });
    this.applyButton = page.getByRole('button' , {name : 'Anwenden' , exact : true});
    this.resetButton = page.getByRole('button' , {name : 'Zurücksetzen' , exact : true});
    this.resetAllButton = page.getByRole('button' , {name : 'Alle zurücksetzen' , exact : true});
    this.organisationFilter = page.locator('#organizations' , { hasText: 'Organisation' });
    this.regimeFilter = page.locator('#baulosSubTypes' , { hasText: 'Regime' });
    this.statusFilter = page.locator('#baulosStatus' , { hasText: 'Status' });
    this.phaseFilter = page.locator('#contractSectionPhaseAdmins' , { hasText: 'Phase' });
    this.importDateFilter = page.locator('#importData' , { hasText: 'Importdatum' });
  }

  trigger(filterId: string): Locator {
  return this.page.locator(`#${filterId}`);
}
  // Returns the checkbox input for one choice inside the open filter dropdown, located
  // by its visible label. Scoped to the dropdown's portal root (#filter-dropdown-root)
  // to avoid ambiguity with identical text elsewhere on the page — e.g. the same
  // organisation name already shown in a table row.
  choiceCheckbox(choiceLabel: string): Locator {
    return this.page
      .locator('#filter-dropdown-root')
      .locator('input[type="checkbox"]')
      .locator('../..')
      .filter({ hasText: choiceLabel })
      .locator('input[type="checkbox"]');
  }
  // Returns the visible label/button for one choice inside the open filter dropdown —
  // this is the real click target. The checkbox's own custom-styled visual (a
  // decorative "square" span) sits on top of the real input and intercepts direct
  // clicks on it; this label is a separate, unobstructed sibling with its own click
  // handler that toggles the same checkbox. Exact match, since choice labels can be
  // short enough to otherwise substring-match a different, longer choice (e.g. "A1"
  // inside "A1 Shop Lugner City").
  choiceLabelButton(choiceLabel: string): Locator {
    return this.page.locator('#filter-dropdown-root').getByText(choiceLabel, { exact: true });
  }
  filterBarChip(filterId: string): Locator {
    // Escape regex-special characters (e.g. "(", ".", "+") before building a RegExp —
    // chip text is real app data (organisation/regime names, etc.), not a hardcoded
    // literal, so it can contain characters that would otherwise break or change the match.
    const escaped = filterId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page.locator('.gucci-common-label-content').filter({ hasText: new RegExp(`^${escaped}$`, 'i') });
  }
  // Returns a filter trigger button by visible name — legacy fallback only. The five
  // Baulose filters (Organisation/Regime/Phase/Status/Importdatum) already have stable
  // ids (added in POSS-3397) — use trigger(filterId) or the named readonly properties
  // (organisationFilter, regimeFilter, etc.) instead of this method for them.
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
  async importDateFilterOpen() : Promise<void> {
    await this.importDateFilter.click();
  }
  async organisationFilterOpen() : Promise<void> {
    await this.organisationFilter.click();
  }
  async regimeFilterOpen() : Promise<void> {
    await this.regimeFilter.click();
  }
  async phaseFilterOpen() : Promise<void> {
    await this.phaseFilter.click();
  }
  async statusFilterOpen() : Promise<void> {
    await this.statusFilter.click();
  }
  
  
}
