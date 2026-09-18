/**
 * Covers: the Sales Actions Phase filter — applying it and verifying results.
 * Trigger: salesActionsPage.phaseFilter (#contractSectionPhaseAdmins) — same id as
 * Baulose's Phase filter. Phase is an FTTH-AUSBAU-specific concept (Pre-Contracting/2nd Run).
 *
 * Confirmed 2026-09-16: Pre-Contracting/2nd Run each render a Phase chip in TWO places —
 * the row's main-info cell (list view, column index FTTH_COLUMNS.adresse) AND the side
 * panel header — checked in both, text + confirmed background color. Keine Phase renders
 * no chip in either place (same "no chip for the null case" behavior Baulose's Phase
 * filter already has).
 */
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { phaseFilterOptions } from '../../../../src/constants/salesActionFiltersValues';
import { SALES_ACTIONS_TABLE_PHASE_CHIP_COLORS } from '../../../../src/constants/salesActionsTableChipColors';
import { FTTH_COLUMNS } from '../../../../src/constants/salesActionsColumnsValues';
import { selectFilterChoiceWithOutSearchInput } from '../../../../src/helpers/filterHelpers';
import { expectEveryRowColumnToContain, expectNoRowColumnContains, expectTableSettled } from '../../../../src/helpers/filterAssertions';

test.describe('Sales Actions Phase Filter Apply', () => {
    for (const [key, option] of Object.entries(phaseFilterOptions)) {
        test(`Apply Phase filter option (${option.label}) and verify results`, async ({ salesActionsPage }) => {
            await test.step('Navigate to FTTH-AUSBAU section', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step(`Select Phase option "${option.label}"`, async () => {
                await selectFilterChoiceWithOutSearchInput(salesActionsPage, () => salesActionsPage.openPhaseFilterDropDown(), option.label);
            });
            await test.step('Apply the filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify chip is visible', async () => {
                await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
            });
            await test.step('Wait for the table to settle', async () => {
                await expectTableSettled(salesActionsPage);
                await expect(salesActionsPage.table.loadingCells).toHaveCount(0);
            });

            if (option.expectChipDisplayed) {
                const chipColor = SALES_ACTIONS_TABLE_PHASE_CHIP_COLORS[key as 'preContracting' | 'secondRun'].color;
                await test.step('Verify every row\'s list view shows the selected Phase chip with the correct color', async () => {
                    await expectEveryRowColumnToContain(salesActionsPage, {
                        columnIndex: FTTH_COLUMNS.adresse,
                        expectedText: option.label,
                        expectedBackgroundColor: chipColor,
                    });
                });
                await test.step('Verify the first row\'s side panel shows the selected Phase chip with the correct color', async () => {
                    await salesActionsPage.openFirstItemSidePanel();
                    await salesActionsPage.expectFtthSalesActionSidePanelOpen();
                    await salesActionsPage.expectPhaseChipInSidePanelHeaderToBe(option.label);
                    await salesActionsPage.expectPhaseChipInSidePanelHeaderColourToBe(option.label);
                });
            } else {
                await test.step('Verify no row shows a Pre-Contracting/2nd Run chip', async () => {
                    await expectNoRowColumnContains(salesActionsPage, FTTH_COLUMNS.adresse, [
                        phaseFilterOptions.preContracting.label,
                        phaseFilterOptions.secondRun.label,
                    ]);
                });
                await test.step('Verify the first row\'s side panel shows no Phase chip', async () => {
                    await salesActionsPage.openFirstItemSidePanel();
                    await salesActionsPage.expectFtthSalesActionSidePanelOpen();
                    await expect(salesActionsPage.phaseChipInSidePanelHeader(phaseFilterOptions.preContracting.label)).not.toBeVisible();
                    await expect(salesActionsPage.phaseChipInSidePanelHeader(phaseFilterOptions.secondRun.label)).not.toBeVisible();
                });
            }
        });
    }
});
