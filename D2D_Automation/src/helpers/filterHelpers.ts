// Shared, reusable filter action helpers. Works with any page object that composes a
// FilterBar (BaulosePage today, ObjektePage/SalesActionsPage/etc. once they need the
// same open-filter -> select -> apply flow).
//
// Actions only — no expect()/test.step() here on purpose, and no raw selectors either:
// DOM knowledge (checkbox structure, portal root, etc.) lives on FilterBar itself.
// Assertions and step narration belong in the spec files where the tests live.
// See src/helpers/filterAssertions.ts for the assertion-helper counterpart.
import { type Page } from '@playwright/test';
import type { FilterBar } from '../components/FilterBar';

type PageWithFilters = {
  filters: FilterBar;
};

// Opens a filter and checks one choice by its visible label. Does not apply it —
// call applyFilterAndWaitForResults separately, so the caller can assert the
// checkbox state in between the two actions if it wants to.
export async function selectFilterChoiceThatContainSearchInput(
  pageObject: PageWithFilters,
  openFilter: () => Promise<void>,
  choiceLabel: string,
): Promise<void> {
  await openFilter();
  await pageObject.filters.expandMoreChoicesIfPresent();
  await pageObject.filters.choiceLabelButton(choiceLabel).click();
}
export async function selectFilterChoiceWithOutSearchInput(
  pageObject: PageWithFilters,
  openFilter: () => Promise<void>,
  choiceLabel: string,
): Promise<void> {
  await openFilter();
  await pageObject.filters.choiceLabelButton(choiceLabel).click();
}

// Clicks "Anwenden" and waits for the resulting list-data network response to resolve
// before returning, so the caller can safely read the table right after this.
export async function applyFilterAndWaitForResults(
  page: Page,
  pageObject: PageWithFilters,
  waitForResponseUrlIncludes: string,
): Promise<void> {
  await Promise.all([
    page.waitForResponse((res) => res.url().includes(waitForResponseUrlIncludes) && res.ok()),
    pageObject.filters.applyFilter(),
  ]);
}
export async function searchByPressingEnterAndWaitForResults(
  page: Page,
  pageObject: PageWithFilters & { searchField: { triggerSearchByPressingEnter: (text: string) => Promise<void> } },
  waitForResponseUrlIncludes: string,
  text: string,
): Promise<void> {
  await Promise.all([
    page.waitForResponse((res) => res.url().includes(waitForResponseUrlIncludes) && res.ok()),
    pageObject.searchField.triggerSearchByPressingEnter(text),
  ]);
}

export async function searchByClickingButtonAndWaitForResults(
  page: Page,
  pageObject: PageWithFilters & { searchField: { triggerSearchByClickingSearchButton: (text: string) => Promise<void> } },
  waitForResponseUrlIncludes: string,
  text: string,
): Promise<void> {
  await Promise.all([
    page.waitForResponse((res) => res.url().includes(waitForResponseUrlIncludes) && res.ok()),
    pageObject.searchField.triggerSearchByClickingSearchButton(text),
  ]);
}