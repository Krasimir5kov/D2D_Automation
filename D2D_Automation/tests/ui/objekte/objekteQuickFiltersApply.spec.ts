import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';
import { ObjektePage } from '../../../src/pages';
import { } from '../../../src/helpers/filterHelpers';
import { expectEveryRowOrganisationStatusToBe, expectEveryRowOrganisationToBe, expectTableSettled } from '../../../src/helpers/filterAssertions';
import { TABLE_STATUS_CHIP_COLORS } from '../../../src/constants/objectStatusChipColors';

// TODO — UNCONFIRMED, verify all of the following via devtools before trusting this file:
// - Real stable id: D2D_Playwright_Attributes_Reference.md only documents the *pattern*
//   quick-filter-{filterId}-{choiceId} (confirmed example: objectType/NEUBAU) — the actual
//   filterId for Übergabestatus was never confirmed. Using text-based locators as a
//   fallback (the locator-priority table's documented last resort) until confirmed; swap
//   to `#quick-filter-{filterId}-{choiceId}` once known.
// - Whether clicking a quick filter needs a separate "Anwenden" step afterward, or filters
//   immediately — assumed immediate here, matching the attributes reference's own quick-
//   filter example (no separate apply call shown), but not independently confirmed for
//   this specific filter.
// - Which table column (if any) reflects Übergabestatus per row — the visible header shows
//   "Privat / D2D SA", not "Übergabestatus"; unclear if these are the same concept. No
//   row-level content check is included below for that reason — add one once confirmed,
//   rather than guessing a column here.
const uebergabestatusChoices = [
    { label: 'nicht übergeben', getButton: (objektePage: ObjektePage) => objektePage.quickFilterOpenButton },
    { label: 'zurückgewiesen', getButton: (objektePage: ObjektePage) => objektePage.quickFilterRejectButton },
    { label: 'übergeben', getButton: (objektePage: ObjektePage) => objektePage.quickFilterAssignedButton },
];
test.describe('Objekte Quick Filters Apply', () => {
    // SKIPPED: known Objekte backend slowness (Neubau salesStartDate sort, Jira-filed
    // 2026-09-02, see project-neubau-sort-performance-bug memory) makes these too slow/
    // unreliable to run until fixed. Remove this test.skip() once that ticket is resolved.
    test.skip();

    test.describe('Verify quick filters are clickable and activated', () => {
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.gotoNeubauSection();
            await objektePage.expectLoadedNeubau();
        });

        for (const choice of uebergabestatusChoices) {
            test(`Apply "${choice.label}" quick filter and verify it becomes pressed`, async ({ objektePage, page }) => {

                const quickFilterButton = choice.getButton(objektePage);

                await test.step(`Verify "${choice.label}" quick filter is visible`, async () => {
                    await expect(quickFilterButton).toBeVisible();
                });
                await test.step(`Click "${choice.label}" quick filter`, async () => {
                    await quickFilterButton.click();
                });
                await test.step('Verify the quick filter is now pressed', async () => {
                    await expect(quickFilterButton).toHaveAttribute('aria-pressed', 'true');
                });
                // TODO: no row-level content check yet — see the file-level comment above.
            });
        }
    });
    test.describe('Verify that quick filters update list view accordingly in three sections', () => {
        const statusesText = [{ open: 'nicht übergeben', rejected: 'zurückgewiesen', assigned: 'übergeben', none: '' }];
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
        });
        test('NEUBAU : Verify results after applying quick filter Nicht übergeben', async ({ objektePage }) => {
            await test.step('Go to Neubau section', async () => {
                await objektePage.gotoNeubauSection();
                await objektePage.expectLoadedNeubau();
            });
            await test.step('Click Nicht übergeben quick filter', async () => {
                await objektePage.quickFilterOpenButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterOpenButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].open)).toBeVisible();
            });
            await test.step('Verify that the list view is updated accordingly', async () => {
                await expectTableSettled(objektePage);
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].open);
            });
            await test.step('Verify that the status chip color is correct for Nicht übergeben', async () => {
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].open, TABLE_STATUS_CHIP_COLORS['nicht übergeben']);
            });
        });
        test('FTTH-AUSBAU : Verify that the list view is in an empty state after applying quick filter Nicht übergeben', async ({ objektePage }) => {
            await test.step('Go to FTTH section', async () => {
                await objektePage.gotoFtthSection();
                await objektePage.expectLoadedFtth();
            });
            await test.step('Click Nicht übergeben quick filter', async () => {
                await objektePage.quickFilterOpenButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterOpenButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].open)).toBeVisible();
            });
            await test.step('Verify that the list view is updated accordingly', async () => {
                await expectTableSettled(objektePage);
                await expect(objektePage.table.emptyStateHeadingByFilterDropdown).toBeVisible();
                await expect(objektePage.table.emptyStateDescriptionByFilterDropdown).toBeVisible();
            });
        });
        test('BESTANDSBAU : Verify that the list view is in an empty state after applying quick filter Nicht übergeben ', async ({ objektePage }) => {
            await test.step('Go to Bestandsbau section', async () => {
                await objektePage.gotoBestandsbauSection();
                await objektePage.expectLoadedBestandsbau();
            });
            await test.step('Click Nicht übergeben quick filter', async () => {
                await objektePage.quickFilterOpenButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterOpenButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].open)).toBeVisible();
            });
            await test.step('Verify that the list view is updated accordingly', async () => {
                await expectTableSettled(objektePage);
                await expect(objektePage.table.emptyStateHeadingByFilterDropdown).toBeVisible();
                await expect(objektePage.table.emptyStateDescriptionByFilterDropdown).toBeVisible();
            });
        });
        test('NEUBAU : Verify results after applying quick filter Zurückgewiesen', async ({ objektePage }) => {
            await test.step('Go to Neubau section', async () => {
                await objektePage.gotoNeubauSection();
                await objektePage.expectLoadedNeubau();
            });
            await test.step('Click Zurückgewiesen quick filter', async () => {
                await objektePage.quickFilterRejectButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterRejectButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].rejected)).toBeVisible();
            });
            await test.step('Verify that the list view is updated accordingly and contains Zurückgewiesen status and chip', async () => {
                await expectTableSettled(objektePage);
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].rejected);
            });
            await test.step('Verify that the status chip color is correct for Zurückgewiesen', async () => {
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].rejected, TABLE_STATUS_CHIP_COLORS['zurückgewiesen']);
            });
        });
        test('FTTH-AUSBAU : Verify that the list view is in an empty state after applying quick filter Zurückgewiesen', async ({ objektePage }) => {
            await test.step('Go to FTTH section', async () => {
                await objektePage.gotoFtthSection();
                await objektePage.expectLoadedFtth();
            });
            await test.step('Click Zurückgewiesen quick filter', async () => {
                await objektePage.quickFilterRejectButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterRejectButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].rejected)).toBeVisible();
            });
            await test.step('Verify that the list view is updated accordingly', async () => {
                await expectTableSettled(objektePage);
                await expect(objektePage.table.emptyStateHeadingByFilterDropdown).toBeVisible();
                await expect(objektePage.table.emptyStateDescriptionByFilterDropdown).toBeVisible();
            });
        });
        test('BESTANDSBAU : Verify that the list view is in an empty state after applying quick filter Zurückgewiesen', async ({ objektePage }) => {
            await test.step('Go to Bestandsbau section', async () => {
                await objektePage.gotoBestandsbauSection();
                await objektePage.expectLoadedBestandsbau();
            });
            await test.step('Click Zurückgewiesen quick filter', async () => {
                await objektePage.quickFilterRejectButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterRejectButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].rejected)).toBeVisible();
            });
            await test.step('Verify that the list view is in an empty state after applying quick filter Zurückgewiesen', async () => {
                await expectTableSettled(objektePage);
                await expect(objektePage.table.emptyStateHeadingByFilterDropdown).toBeVisible();
                await expect(objektePage.table.emptyStateDescriptionByFilterDropdown).toBeVisible();
            });
        });
        test('NEUBAU : Verify results after applying quick filter Übergeben', async ({ objektePage }) => {
            await test.step('Go to Neubau section', async () => {
                await objektePage.gotoNeubauSection();
                await objektePage.expectLoadedNeubau();
            });
            await test.step('Click Übergeben quick filter', async () => {
                await objektePage.quickFilterAssignedButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterAssignedButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].assigned)).toBeVisible();
            });
            await test.step('Verify that the list view is updated accordingly and contains Übergeben status and chip', async () => {
                await expectTableSettled(objektePage);
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].assigned);
            });
            await test.step('Verify that the status chip color is correct for Übergeben', async () => {
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].assigned, TABLE_STATUS_CHIP_COLORS['übergeben']);
            });
        });
        test('FTTH-AUSBAU : Verify results after applying quick filter Übergeben', async ({ objektePage }) => {
            await test.step('Go to FTTH section', async () => {
                await objektePage.gotoFtthSection();
                await objektePage.expectLoadedFtth();
            });
            await test.step('Click Übergeben quick filter', async () => {
                await objektePage.quickFilterAssignedButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterAssignedButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].assigned)).toBeVisible();
            });
            await test.step('Verify that the list view is updated accordingly and contains Übergeben status and chip', async () => {
                await expectTableSettled(objektePage);
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].none);
            });
            await test.step('Verify that the list view is updated accordingly and there is no chip for Übergeben', async () => {
                await expectTableSettled(objektePage);
                await expect(objektePage.table.loadingCells).toHaveCount(0);
                await expect(objektePage.table.emptyStateDescriptionByFilterDropdown).not.toBeVisible();
                await expect(objektePage.table.emptyStateHeadingByFilterDropdown).not.toBeVisible();
                await expect(objektePage.table.rows).toHaveCount(25);
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].none);
            });
        });
        test('BESTANDSBAU : Verify results after applying quick filter Übergeben', async ({ objektePage }) => {
            await test.step('Go to Bestandsbau section', async () => {
                await objektePage.gotoBestandsbauSection();
                await objektePage.expectLoadedBestandsbau();
            });
            await test.step('Click Übergeben quick filter', async () => {
                await objektePage.quickFilterAssignedButton.click();
            });
            await test.step('Verify the quick filter is now pressed', async () => {
                await expect(objektePage.quickFilterAssignedButton).toHaveAttribute('aria-pressed', 'true');
            });
            await test.step('Verify that the chip is displayed in the filter bar', async () => {
                await expect(objektePage.filters.filterBarChip(statusesText[0].assigned)).toBeVisible();
            });
            await test.step('Verify that the list view is updated accordingly and there is no chip for Übergeben', async () => {
                await expectTableSettled(objektePage);
                await expect(objektePage.table.loadingCells).toHaveCount(0);
                await expect(objektePage.table.emptyStateDescriptionByFilterDropdown).not.toBeVisible();
                await expect(objektePage.table.emptyStateHeadingByFilterDropdown).not.toBeVisible();
                await expect(objektePage.table.rows).toHaveCount(25);
                await expectEveryRowOrganisationStatusToBe(objektePage, statusesText[0].none);
            });
        });
    });


});

