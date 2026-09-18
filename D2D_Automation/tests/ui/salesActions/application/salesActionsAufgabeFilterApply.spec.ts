/**
 * Covers: the Sales Actions Aufgabe filter — applying it and verifying results.
 * Trigger: salesActionsPage.aufgabeFilter (#salesActionTasks).
 *
 * Confirmed via devtools 2026-09-09: only leerverrohrungscheck/nachverdichtung are
 * FTTH-AUSBAU-specific tasks, every other option here is Bestandsbau-specific — see
 * aufgabeFilterOptions (salesActionFiltersValues.ts) for the full per-option mapping.
 * A row's task chip has no stable attribute of its own (see expectEveryRowAufgabeChipToBe),
 * and its background color is always the same regardless of which task it is
 * (SALES_ACTIONS_TABLE_AUFGABE_CHIP_COLOR).
 */
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { aufgabeFilterOptions } from '../../../../src/constants/salesActionFiltersValues';
import { selectFilterChoiceExpandingAllOptions } from '../../../../src/helpers/filterHelpers';
import { expectEveryRowAufgabeChipToBe, expectListIsEmptyWithMessageByFilterDropDown } from '../../../../src/helpers/filterAssertions';
import { SALES_ACTIONS_TABLE_AUFGABE_CHIP_COLOR } from '../../../../src/constants/salesActionsTableChipColors';

test.describe('Sales Actions Aufgabe Filter Apply', { tag: ['@Admin', '@Admin-Regional', '@Channel', '@Agent'] }, () => {
    test.describe('Apply every Aufgabe filter option in its expected section and verify results', () => {
        for (const option of Object.values(aufgabeFilterOptions)) {
            test(`Apply Aufgabe filter option (${option.label}) and verify results`, async ({ salesActionsPage }) => {
                await test.step('Navigate to the section this task is expected in', async () => {
                    if (option.expectedInFTTH) {
                        await salesActionsPage.gotoFtthSalesAction();
                        await salesActionsPage.expectLoadedFTTH();
                    } else {
                        await salesActionsPage.gotoBestandsbauSalesAction();
                        await salesActionsPage.expectLoadedBestandsbau();
                    }
                });
                await test.step('Verify Aufgabe filter is visible and available', async () => {
                    await expect(salesActionsPage.aufgabeFilter).toBeVisible();
                });
                await test.step(`Select Aufgabe option "${option.label}"`, async () => {
                    await selectFilterChoiceExpandingAllOptions(salesActionsPage, () => salesActionsPage.openAufgabeFilterDropDown(), option.label);
                });
                await test.step('Apply the filter', async () => {
                    await salesActionsPage.filters.applyFilter();
                });
                await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                    await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
                });
                await test.step('Verify that every row shows the selected Aufgabe task', async () => {
                    await expectEveryRowAufgabeChipToBe(salesActionsPage, option.label, SALES_ACTIONS_TABLE_AUFGABE_CHIP_COLOR);
                });
            });
        }
    });

    test.describe('Verify FTTH-AUSBAU-specific Aufgabe options are absent from the other sections', () => {
        for (const ftthOption of Object.values(aufgabeFilterOptions).filter((option) => option.expectedInFTTH)) {
            test(`Apply Aufgabe filter option (${ftthOption.label}) then verify that Neubau and Bestandsbau are in empty state`, async ({ salesActionsPage }) => {
                await test.step('Navigate to FTTH-AUSBAU section', async () => {
                    await salesActionsPage.gotoFtthSalesAction();
                    await salesActionsPage.expectLoadedFTTH();
                });
                await test.step(`Select Aufgabe option "${ftthOption.label}"`, async () => {
                    await selectFilterChoiceExpandingAllOptions(salesActionsPage, () => salesActionsPage.openAufgabeFilterDropDown(), ftthOption.label);
                });
                await test.step('Apply the filter', async () => {
                    await salesActionsPage.filters.applyFilter();
                });
                await test.step('Navigate to Neubau section and verify that the list is in empty state', async () => {
                    await salesActionsPage.gotoNeubauSalesAction();
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                });
                await test.step('Navigate to Bestandsbau section and verify that the list is in empty state', async () => {
                    await salesActionsPage.gotoBestandsbauSalesAction();
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                });
            });
        }
    });
    test.describe('Verify BESTANDSBAU-specific Aufgabe options are absent from the other sections', () => {
        for (const bestandsbauOption of Object.values(aufgabeFilterOptions).filter((option) => option.expectedInBestandsbau)) {
            test(`Apply Aufgabe filter option (${bestandsbauOption.label}) then verify that FTTH-AUSBAU and Neubau are in empty state`, async ({ salesActionsPage }) => {
                await test.step('Navigate to BESTANDSBAU section', async () => {
                    await salesActionsPage.gotoBestandsbauSalesAction();
                    await salesActionsPage.expectLoadedBestandsbau();
                });
                await test.step(`Select Aufgabe option "${bestandsbauOption.label}"`, async () => {
                    await selectFilterChoiceExpandingAllOptions(salesActionsPage, () => salesActionsPage.openAufgabeFilterDropDown(), bestandsbauOption.label);
                });
                await test.step('Apply the filter', async () => {
                    await salesActionsPage.filters.applyFilter();
                });
                await test.step('Navigate to FTTH-AUSBAU section and verify that the list is in empty state', async () => {
                    await salesActionsPage.gotoFtthSalesAction();
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                });
                await test.step('Navigate to Neubau section and verify that the list is in empty state', async () => {
                    await salesActionsPage.gotoNeubauSalesAction();
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                });
            });
        }
    });
});
