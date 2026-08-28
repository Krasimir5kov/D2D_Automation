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
import { type TableView } from '../components/TableView';
import { table } from 'console';

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
export type FirstRowBauloseEinsatzname = {
  // The bare name only (before the dash) — what the filter's search box matches on.
  searchTerm: string;
  // The whole Einsatzname line, dash included (e.g. "Name - Name" on Bestandsbau,
  // "Name - UniqueID" on FTTH-Ausbau) — confirmed to be exactly what the applied
  // filter's chip displays, unlike the trimmed searchTerm.
  fullEinsatznameLine: string;
};

// The name cell contains multiple separate lines (address, then the Baulos/Einsatzname
// line), joined by newlines when read via innerText() — splitting the whole cell text on
// the dash directly would incorrectly include the address, since only the Einsatzname
// line actually contains one. Isolate that line first, then split it.
export async function getFirstRowBauloseEinsatzname(pageObject: { table: TableView }): Promise<FirstRowBauloseEinsatzname> {
  const cellText = await pageObject.table.rows.first().locator("td[id$='-name']").innerText();
  const lines = cellText.split('\n');
  const einsatznameLine = lines.find((line) => /\s+-\s+/.test(line));
  if (!einsatznameLine) {
    throw new Error(`Could not find a Baulos/Einsatzname line in: "${cellText}"`);
  }
  return {
    searchTerm: einsatznameLine.split(/\s+-\s+/)[0].trim(),
    fullEinsatznameLine: einsatznameLine.trim(),
  };
}

export type FirstRowOrganisation = {
  // Bare organisation name, with any "(Vertriebsschienenregion)" suffix stripped —
  // matches the filter dropdown's own choice label, which never includes the region.
  // Use this for searching/selecting in the dropdown.
  name: string;
  // The full text exactly as displayed in the row — just the name if the organisation
  // has no region, or "Name (Region)" if it does. Use this for row-verification, since
  // the row can legitimately differ from the dropdown's plain-name format.
  fullDisplayText: string;
};

// Organisation is its own dedicated cell (td[id$='-organisation']), confirmed in
// D2D_Playwright_Attributes_Reference.md. Some organisations additionally show their
// Vertriebsschienenregion in parentheses after the name in this cell — the dropdown's
// own choice labels never include it, so the two need to be told apart here rather than
// passing one raw string on to both the search step and the row-verification step. On
// Neubau, this cell also contains a second, separate status-chip line (e.g. "übergeben")
// — innerText() joins it onto the organisation text with a newline, so only the first
// line is the actual organisation.
export async function getFirstRowOrganisationNeubau(pageObject: { table: TableView }): Promise<FirstRowOrganisation> {
  const cellText = (await pageObject.table.rows.first().locator("td[id$='-organisation']").innerText()).trim();
  const text = cellText.split('\n')[0].trim();
  const regionMatch = text.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return {
    name: regionMatch ? regionMatch[1].trim() : text,
    fullDisplayText: text,
  };
}
