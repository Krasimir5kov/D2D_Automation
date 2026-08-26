// Explicit assertion helpers for filter/list-result checks. Named with an "expect"
// prefix on purpose, unlike the action helpers in filterHelpers.ts, so it's
// unmistakable at a glance that these functions DO contain assertions.
import { expect, type Locator } from '@playwright/test';
import type { TableView } from '../components/TableView';
import type { FilterBar } from '../components/FilterBar';

type PageWithTable = {
  table: TableView;
  filters: FilterBar;
};

// Empty-state message locators are page-specific (each page's empty state has its own
// wording), so they live on the page object itself rather than on the shared TableView.
type PageWithEmptyState = PageWithTable & {
  emptyStateHeadingByFilterDropdown: Locator;
  emptyStateDescriptionByFilterDropdown: Locator;
  emptyStateHeadingBySearchInput: Locator;
  emptyStateDescriptionBySearchInput: Locator;
};

// Waits for any loading-placeholder rows to be gone. The network response resolving
// doesn't guarantee React has already finished re-rendering to match it, so callers
// should not read row count/content until this has settled.
async function waitForTableSettled(pageObject: PageWithTable): Promise<void> {
  await expect(pageObject.table.loadingCells).toHaveCount(0, {timeout:60000});
}
export async function expectTableSettled(
  pageObject: PageWithTable,
  { timeout = 30000 }: { timeout?: number } = {},
): Promise<void> {
  await expect(pageObject.table.loadingCells).toHaveCount(0);
}

export type ExpectEveryRowColumnToContainOptions = {
  columnIndex: number;
  expectedText: string;
};
export type ExpectEveryRowPlzWithinRangeOptions = {
  from: number;
  to: number;
};
export async function expectEveryRowPlzWithinRange(
  pageObject: PageWithTable,
  { from, to }: ExpectEveryRowPlzWithinRangeOptions,
): Promise<void> {
  await waitForTableSettled(pageObject);

  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const objektCellTexts = await rows.locator(`td[id$='-name']`).allInnerTexts();
  objektCellTexts.forEach((text, i) => {
    const plz = Number(text.trim().split(/\s+/)[0]);
    expect(plz, `row ${i}: could not parse a PLZ from "${text}"`).not.toBeNaN();
    expect(plz, `row ${i}: PLZ ${plz} not within [${from}, ${to}]`).toBeGreaterThanOrEqual(from);
    expect(plz).toBeLessThanOrEqual(to);
  });

}
export type ExpectPlzRangeChipVisibleOptions = {
  from: number;
  to: number;
};
export async function expectPlzRangeChipVisible(
  pageObject: PageWithTable,
  { from, to }: ExpectPlzRangeChipVisibleOptions,
): Promise<void> {
  const expectedchipTextConcatenated = `PLZ: ${from}  - ${to}`;
  await expect(pageObject.filters.filterBarChip(expectedchipTextConcatenated)).toBeVisible();
}
// Asserts every currently rendered row's given column contains the expected text.
export async function expectEveryRowColumnToContain(
  pageObject: PageWithTable,
  { columnIndex, expectedText }: ExpectEveryRowColumnToContainOptions,
): Promise<void> {
  await waitForTableSettled(pageObject);

  const rows = pageObject.table.rows;
  // Once this passes, at least one row is confirmed present — no need for a separate,
  // non-retrying rowCount > 0 check after it.
  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    await expect(rows.nth(i).locator('td').nth(columnIndex)).toContainText(expectedText);
  }
}

// Asserts the list is currently empty (no data rows).
export async function expectListIsEmptyWithMessageByFilterDropDown(pageObject: PageWithEmptyState): Promise<void> {
  await waitForTableSettled(pageObject);
  await expect(pageObject.emptyStateHeadingByFilterDropdown).toBeVisible();
  await expect(pageObject.emptyStateDescriptionByFilterDropdown).toBeVisible();
}
export async function expectListIsEmptyWithMessageBySearchInput(pageObject: PageWithEmptyState): Promise<void> {
  await waitForTableSettled(pageObject);
  await expect(pageObject.emptyStateHeadingBySearchInput).toBeVisible();
  await expect(pageObject.emptyStateDescriptionBySearchInput).toBeVisible();
}
export async function expectListIsNotEmpty(pageObject: PageWithTable): Promise<void> {
  await waitForTableSettled(pageObject);
  await expect(pageObject.table.rows.first()).toBeVisible();
}
