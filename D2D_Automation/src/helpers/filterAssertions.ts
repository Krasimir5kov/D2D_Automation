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
  // Optional — only checked when provided, so existing callers that don't care about
  // color are unaffected. Must be the computed rgb()/rgba() form (what getComputedStyle
  // actually returns), not a CSS variable reference or hex value.
  expectedBackgroundColor?: string;
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
// background-color doesn't inherit, so the element carrying the visible text is often
// NOT the element the color is actually set on (a colored ancestor div, with the text
// sitting in a plain, transparent inner span) — climbing up to the nearest ancestor
// that actually has a non-transparent background avoids having to guess/hardcode how
// many parent levels that takes, which can differ between chip variants.
async function nearestNonTransparentBackgroundColor(locator: Locator): Promise<string> {
  return locator.evaluate((el) => {
    let node: Element | null = el;
    while (node) {
      const backgroundColor = getComputedStyle(node).backgroundColor;
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        return backgroundColor;
      }
      node = node.parentElement;
    }
    return getComputedStyle(el).backgroundColor;
  });
}

// Asserts every currently rendered row's given column contains the expected text, and
// optionally that the badge showing that text has the expected background color.
export async function expectEveryRowColumnToContain(
  pageObject: PageWithTable,
  { columnIndex, expectedText, expectedBackgroundColor }: ExpectEveryRowColumnToContainOptions,
): Promise<void> {
  await waitForTableSettled(pageObject);

  const rows = pageObject.table.rows;
  // Once this passes, at least one row is confirmed present — no need for a separate,
  // non-retrying rowCount > 0 check after it.
  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    await expect(rows.nth(i).locator('td').nth(columnIndex)).toContainText(expectedText);
    if (expectedBackgroundColor) {
      // The color lives on the badge/pill itself, not the whole <td> (which is
      // transparent) — locate it by its own visible text rather than the cell.
      const backgroundColor = await nearestNonTransparentBackgroundColor(
        rows.nth(i).getByText(expectedText, { exact: true }),
      );
      expect(
        backgroundColor,
        `row ${i}: expected background ${expectedBackgroundColor}, got ${backgroundColor}`,
      ).toBe(expectedBackgroundColor);
    }
  }
}

// Asserts the list is currently empty (no data rows).
export async function expectListIsEmptyWithMessageByFilterDropDown(pageObject: PageWithTable): Promise<void> {
  await waitForTableSettled(pageObject);
  await expect(pageObject.table.emptyStateHeadingByFilterDropdown).toBeVisible();
  await expect(pageObject.table.emptyStateDescriptionByFilterDropdown).toBeVisible();
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
export async function expectEveryRowBauloseEinsatznameToBe(
  pageObject: PageWithTable,
  name: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const objektCellTexts = await rows.locator(`td[id$='-name']`).allInnerTexts();
  objektCellTexts.forEach((text, i) => {
    const lines = text.split('\n');
    const einsatznameLine = lines.find((line) => /\s+-\s+/.test(line));
    const bauloseEinsatzname = einsatznameLine ? einsatznameLine.split(/\s+-\s+/)[0].trim() : '';
    expect(bauloseEinsatzname, `row ${i}: Baulos/Einsatzname "${bauloseEinsatzname}" does not match expected "${name}"`).toBe(name);
  });
}

// Organisation is its own dedicated cell (td[id$='-organisation']). On Neubau, this cell
// also contains a second, separate status-chip line (e.g. "übergeben") — innerText()
// joins it onto the organisation text with a newline, so only the first line is the
// actual organisation, same reasoning as getFirstRowOrganisation() in filterHelpers.ts.
export async function expectEveryRowOrganisationToBe(
  pageObject: PageWithTable,
  name: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const organisationCellTexts = await rows.locator(`td[id$='-organisation']`).allInnerTexts();
  organisationCellTexts.forEach((text, i) => {
    const organisation = text.split('\n')[0].trim();
    expect(organisation, `row ${i}: Organisation "${organisation}" does not match expected "${name}"`).toBe(name);
  });
}
