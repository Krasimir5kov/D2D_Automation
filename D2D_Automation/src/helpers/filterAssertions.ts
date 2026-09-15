// Explicit assertion helpers for filter/list-result checks. Named with an "expect"
// prefix on purpose, unlike the action helpers in filterHelpers.ts, so it's
// unmistakable at a glance that these functions DO contain assertions.
import { expect, test, type Locator } from '@playwright/test';
import type { TableView } from '../components/TableView';
import type { FilterBar } from '../components/FilterBar';
import type { AppNavigation } from '../components/AppNavigation';

type PageWithTable = {
  table: TableView;
  filters: FilterBar;
  navigation: AppNavigation;
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
async function waitForTableSettled(pageObject: PageWithTable, shortTimeout = 30000): Promise<void> {
  try {
    await expect(pageObject.table.loadingCells).toHaveCount(0, { timeout: shortTimeout });
  } catch {
    // Loading placeholders never cleared within the short timeout — bounce to
    // another page and back (browser history, not a hard reload) to force a fresh
    // fetch, then wait again. Confirmed to preserve already-applied filters.
    await pageObject.navigation.bounceToAnotherPageAndBack();
    await expect(pageObject.table.loadingCells).toHaveCount(0, { timeout: 60000 });
  }
}
export async function expectTableSettled(
  pageObject: PageWithTable
): Promise<void> {
  await waitForTableSettled(pageObject);
}

export type ExpectEveryRowColumnToContainOptions = {
  columnIndex: number;
  expectedText: string;
  // Optional — only checked when provided, so existing callers that don't care about
  // color are unaffected. Must be the computed rgb()/rgba() form (what getComputedStyle
  // actually returns), not a CSS variable reference or hex value.
  expectedBackgroundColor?: string;
  // Optional — some columns render filter-option-style words in a different case than the
  // filter's own label (e.g. Verkaufsstart-Status shows "vor Aviso" for the "Vor Aviso"
  // filter option), so this is opt-in rather than the default for every existing caller.
  ignoreCase?: boolean;
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
export type ExpectEveryRowSalesStartWithinRelativeRangeOptions = {
  columnIndex: number;
  maxDaysFromToday: number;
};
// Verkaufsstart's column shows a real computed date ("13.09.2026 bestätigt"), never the
// filter option's bucket label — unlike Fragebogen/PLZ-style filters where the column
// literally echoes the selected option. So this parses the date out of the cell and checks
// it falls within [today, today + maxDaysFromToday], instead of a literal text match.
export async function expectEveryRowSalesStartWithinRelativeRange(
  pageObject: PageWithTable,
  { columnIndex, maxDaysFromToday }: ExpectEveryRowSalesStartWithinRelativeRangeOptions,
): Promise<void> {
  await waitForTableSettled(pageObject);

  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDaysFromToday);

  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const cellText = (await rows.nth(i).locator('td').nth(columnIndex).innerText()).trim();
    const match = cellText.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    expect(match, `row ${i}: could not parse a date from "${cellText}"`).not.toBeNull();
    const [, day, month, year] = match!;
    const rowDate = new Date(Number(year), Number(month) - 1, Number(day));
    expect(
      rowDate.getTime(),
      `row ${i}: date ${cellText} not within [${today.toDateString()}, ${maxDate.toDateString()}]`,
    ).toBeGreaterThanOrEqual(today.getTime());
    expect(rowDate.getTime()).toBeLessThanOrEqual(maxDate.getTime());
  }
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
export async function nearestNonTransparentBackgroundColor(locator: Locator): Promise<string> {
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
  { columnIndex, expectedText, expectedBackgroundColor, ignoreCase }: ExpectEveryRowColumnToContainOptions,
): Promise<void> {
  await waitForTableSettled(pageObject);

  const rows = pageObject.table.rows;
  // Once this passes, at least one row is confirmed present — no need for a separate,
  // non-retrying rowCount > 0 check after it.
  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    await expect(rows.nth(i).locator('td').nth(columnIndex)).toContainText(expectedText, { ignoreCase });
    if (expectedBackgroundColor) {
      // The color lives on the badge/pill itself, not the whole <td> (which is
      // transparent) — locate it by its own visible text rather than the cell. Matches
      // ignoreCase too, so the color lookup doesn't break for a caller combining both.
      const textLocator = ignoreCase
        ? rows.nth(i).getByText(new RegExp(`^${expectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'))
        : rows.nth(i).getByText(expectedText, { exact: true });
      const backgroundColor = await nearestNonTransparentBackgroundColor(
        textLocator,
      );
      expect(
        backgroundColor,
        `row ${i}: expected background ${expectedBackgroundColor}, got ${backgroundColor}`,
      ).toBe(expectedBackgroundColor);
    }
  }
}

// Inverse of expectEveryRowColumnToContain — asserts NO row's given column contains any of
// the given texts. Used where a filter option means "this content should be absent" (e.g.
// Sales Actions Phase's "Keine Phase" — no Pre-Contracting/2nd Run chip anywhere).
export async function expectNoRowColumnContains(
  pageObject: PageWithTable,
  columnIndex: number,
  forbiddenTexts: string[],
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    for (const text of forbiddenTexts) {
      await expect(rows.nth(i).locator('td').nth(columnIndex), `row ${i}: should not contain "${text}"`).not.toContainText(text);
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

// Wraps a row-content check for filters whose correct result can legitimately be zero
// rows depending on what data currently exists (e.g. a rolling relative-date window
// like Verkaufsstart-Termin), as opposed to filters where zero rows always means a
// bug. On zero rows, verifies the empty-state UI instead and attaches a report
// annotation explaining why — the positive-path check is caller-supplied so this stays
// reusable for other filters with the same data-availability uncertainty later.
export async function expectEveryRowOrEmptyState(
  pageObject: PageWithTable,
  verifyRowContent: () => Promise<void>,
  emptyStateAnnotation: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rowCount = await pageObject.table.rows.count();
  if (rowCount === 0) {
    test.info().annotations.push({ type: 'no-fixture-data', description: emptyStateAnnotation });
    await expectListIsEmptyWithMessageByFilterDropDown(pageObject);
  } else {
    await verifyRowContent();
  }
}
export async function expectEveryRowBauloseEinsatznameToBe(
  pageObject: PageWithTable & { listRows: Locator; baulosEinsatznameContents: Locator },
  name: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  await expect(pageObject.listRows.first()).toBeVisible();

  // Retry the complete check as React replaces the filtered rows. Never pass on
  // zero content elements: each current data row must have matching content.
  await expect(async () => {
    const rowCount = await pageObject.listRows.count();
    expect(rowCount, 'The filtered list must contain at least one row').toBeGreaterThan(0);
    await expect(pageObject.baulosEinsatznameContents).toHaveCount(rowCount);
    const texts = await pageObject.baulosEinsatznameContents.allInnerTexts();
    expect(texts).toHaveLength(rowCount);
    texts.forEach((text, index) => {
      const line = text.split('\n').find(value => /\s+-\s+/.test(value));
      const actualName = line?.split(/\s+-\s+/)[0].trim();
      expect(actualName, `Row ${index + 1}: expected Baulos/Einsatzname "${name}"`).toBe(name);
    });
  }).toPass({ timeout: 10000 });
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
export async function expectEveryRowOrganisationStatusToBe(
  pageObject: PageWithTable,
  expectedStatus: string,
  expectedBackgroundColor?: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const organisationCellTexts = await rows.locator(`td[id$='-organisation']`).allInnerTexts();
  for (let i = 0; i < organisationCellTexts.length; i++) {
    const status = organisationCellTexts[i].split('\n')[1]?.trim() ?? '';
    expect(status, `row ${i}: expected status "${expectedStatus}" but got "${status}"`).toBe(expectedStatus);
    if (expectedBackgroundColor) {
      // Same reasoning as expectEveryRowColumnToContain: background-color doesn't
      // inherit, so climb to the nearest ancestor that actually has a real one.
      const backgroundColor = await nearestNonTransparentBackgroundColor(
        rows.nth(i).getByText(expectedStatus, { exact: true }),
      );
      expect(
        backgroundColor,
        `row ${i}: expected background ${expectedBackgroundColor}, got ${backgroundColor}`,
      ).toBe(expectedBackgroundColor);
    }
  }
}

// Asserts every row's overall Status chip (role="status", e.g. inside
// #sales-action-row-{id}-status) shows the expected label, and optionally that it has
// the expected background color. Scoped by the stable role="status" attribute rather
// than a column index — Sales Actions has no column-index constants file the way
// Baulose does, and the Status cell itself embeds more than just this chip (e.g. the
// Ergebnis value and date sit in the same cell, as a separate, uncolored line).
export async function expectEveryRowStatusChipToBe(
  pageObject: PageWithTable,
  expectedStatusLabel: string,
  expectedBackgroundColor?: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const statusChips = pageObject.table.rows.locator('[role="status"]');
  await expect(statusChips.first()).toBeVisible();

  const count = await statusChips.count();
  for (let i = 0; i < count; i++) {
    await expect(statusChips.nth(i), `row ${i}: expected status "${expectedStatusLabel}"`).toContainText(expectedStatusLabel);
    if (expectedBackgroundColor) {
      // Climb from the text itself, not from [role="status"] — the actual colored chip
      // div is a *child* of role="status", not an ancestor, so starting from role="status"
      // climbs straight past it and lands on the table row's own (zebra-striped, so
      // inconsistent) background instead.
      const backgroundColor = await nearestNonTransparentBackgroundColor(
        statusChips.nth(i).getByText(expectedStatusLabel, { exact: true }),
      );
      expect(
        backgroundColor,
        `row ${i}: expected background ${expectedBackgroundColor}, got ${backgroundColor}`,
      ).toBe(expectedBackgroundColor);
    }
  }
}

// Asserts every row shows the expected Aufgabe task chip, and optionally that it has the
// expected background color. Confirmed via devtools 2026-09-09: a row's task chips render
// as separate sibling divs alongside (not inside) the [role="status"] Status chip — none of
// them carry role="status" or any other stable attribute, and a row can show several tasks
// at once (e.g. a Bestandsbau row with "BBI zu Netcube"/"Upsell Netcube"/"Verkauf Netcube"
// all applied). So this locates by the task's own exact visible text within the row, the
// same technique already used for the color-lookup branches above, rather than a role or
// column index.
export async function expectEveryRowAufgabeChipToBe(
  pageObject: PageWithTable,
  expectedTaskLabel: string,
  expectedBackgroundColor?: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const taskChip = rows.nth(i).getByText(expectedTaskLabel, { exact: true });
    await expect(taskChip, `row ${i}: expected Aufgabe task "${expectedTaskLabel}"`).toBeVisible();
    if (expectedBackgroundColor) {
      const backgroundColor = await nearestNonTransparentBackgroundColor(taskChip);
      expect(
        backgroundColor,
        `row ${i}: expected background ${expectedBackgroundColor}, got ${backgroundColor}`,
      ).toBe(expectedBackgroundColor);
    }
  }
}
// Asserts every row's own data-regime attribute (confirmed present directly on the <tr>
// for Sales Actions rows) equals the expected value - a data attribute, so this is
// preferred over a text-column match per this project's locator-priority rules.
export async function expectEveryRowRegimeToBe(
  pageObject: PageWithTable,
  expectedRegime: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const regimes = await rows.evaluateAll((rowElements) => rowElements.map((row) => row.getAttribute('data-regime')));
  regimes.forEach((regime, i) => {
    expect(regime, `row ${i}: expected data-regime "${expectedRegime}", got "${regime}"`).toBe(expectedRegime);
  });
}
// Sales Actions equivalent of expectEveryRowOrganisationToBe — that one depends on
// Objekte's dedicated td[id$='-organisation'] cell, which Sales Actions rows don't have.
export async function expectEveryRowSalesActionOrganisationToBe(
  pageObject: PageWithTable & { organisationInRow: (row: Locator) => Locator },
  name: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    await expect(pageObject.organisationInRow(rows.nth(i)), `row ${i}: expected Organisation "${name}"`).toHaveText(name);
  }
}
export async function expectEveryRowDataObjectNameToContain(
  pageObject: PageWithTable,
  searchValue: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const objectNames = await rows.evaluateAll((rowElements) =>
    rowElements.map((row) => row.getAttribute('data-object-name')),
  );
  const searchValueLower = searchValue.toLowerCase();
  objectNames.forEach((name, i) => {
    expect(
      name?.toLowerCase().includes(searchValueLower),
      `row ${i}: data-object-name "${name}" does not contain searched value "${searchValue}"`,
    ).toBe(true);
  });
}
export async function expectEveryRowNameCellToContain(
  pageObject: PageWithTable,
  searchValue: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();

  const nameCellTexts = await rows.locator(`td[id$='-name']`).allInnerTexts();
  const searchValueLower = searchValue.toLowerCase();
  nameCellTexts.forEach((text, i) => {
    expect(
      text.toLowerCase().includes(searchValueLower),
      `row ${i}: name cell "${text}" does not contain searched value "${searchValue}"`,
    ).toBe(true);
  });
}
export async function expectEveryRowKundendatenIconToBe(
  pageObject: PageWithTable & { kundendatenIconInRow: (row: Locator) => Locator },
  expectedPresent: boolean,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const icon = pageObject.kundendatenIconInRow(rows.nth(i));
    if (expectedPresent) {
      await expect(icon, `row ${i}: expected Kundendaten icon present`).toBeVisible();
    } else {
      await expect(icon, `row ${i}: expected no Kundendaten icon`).toHaveCount(0);
    }
  }
}
export async function expectEveryRowIconToBe(
  pageObject: PageWithTable,
  iconInRow: (row: Locator) => Locator,
  expectedPresent: boolean,
  iconLabel: string,
): Promise<void> {
  await waitForTableSettled(pageObject);
  const rows = pageObject.table.rows;
  await expect(rows.first()).toBeVisible();
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const icon = iconInRow(rows.nth(i));
    if (expectedPresent) {
      await expect(icon, `row ${i}: expected ${iconLabel} icon present`).toBeVisible();
    } else {
      await expect(icon, `row ${i}: expected no ${iconLabel} icon`).toHaveCount(0);
    }
  }
}


