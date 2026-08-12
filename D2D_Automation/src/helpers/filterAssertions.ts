// Explicit assertion helpers for filter/list-result checks. Named with an "expect"
// prefix on purpose, unlike the action helpers in filterHelpers.ts, so it's
// unmistakable at a glance that these functions DO contain assertions.
import { expect } from '@playwright/test';
import type { TableView } from '../components/TableView';

type PageWithTable = {
  table: TableView;
};

// Waits for any loading-placeholder rows to be gone. The network response resolving
// doesn't guarantee React has already finished re-rendering to match it, so callers
// should not read row count/content until this has settled.
async function waitForTableSettled(pageObject: PageWithTable): Promise<void> {
  await expect(pageObject.table.loadingCells).toHaveCount(0);
}

export type ExpectEveryRowColumnToContainOptions = {
  columnIndex: number;
  expectedText: string;
};

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
export async function expectListIsEmptyWithMessage(pageObject: PageWithTable): Promise<void> {
  await waitForTableSettled(pageObject);
  await expect(pageObject.table.emptyStateHeading).toBeVisible();
  await expect(pageObject.table.emptyStateDescription).toBeVisible();
}
export async function expectListIsNotEmpty(pageObject: PageWithTable): Promise<void> {
  await waitForTableSettled(pageObject);
  await expect(pageObject.table.rows.first()).toBeVisible();
}
