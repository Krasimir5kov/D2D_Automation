/**
 * Covers: the Sales Actions Regime filter — applying it and verifying results.
 * Trigger: salesActionsPage.regimeFilter (#salesActionObjectSubType).
 *
 * Confirmed 2026-09-15: same Regime values/FTTH-vs-Bestandsbau split as Baulose (VHCN/ZAG
 * FTTH-only, FTTB/FTTC Bestandsbau-only), and every row carries its own data-regime
 * attribute directly on the <tr> - see expectEveryRowRegimeToBe. Neubau has no underlying
 * Baulos/contract-section data, so no Regime value is ever expected to return rows there.
 */
import { test } from '../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { regimeFilterOptions } from '../../../src/constants/salesActionFiltersValues';
import { selectFilterChoiceExpandingAllOptions } from '../../../src/helpers/filterHelpers';
import { expectEveryRowRegimeToBe, expectListIsEmptyWithMessageByFilterDropDown } from '../../../src/helpers/filterAssertions';

test.describe('Sales Actions Regime Filter Apply', () => {
    for (const option of Object.values(regimeFilterOptions)) {
        test(`Apply Regime filter option (${option.label}) and verify results across all sections`, async ({ salesActionsPage }) => {
            await test.step('Navigate to the section this Regime is expected in', async () => {
                if (option.expectedInFTTH) {
                    await salesActionsPage.gotoFtthSalesAction();
                    await salesActionsPage.expectLoadedFTTH();
                } else {
                    await salesActionsPage.gotoBestandsbauSalesAction();
                    await salesActionsPage.expectLoadedBestandsbau();
                }
            });
            await test.step(`Select Regime option "${option.label}"`, async () => {
                await selectFilterChoiceExpandingAllOptions(salesActionsPage, () => salesActionsPage.openRegimeFilterDropDown(), option.label);
            });
            await test.step('Apply the filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify chip is visible', async () => {
                await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
            });
            await test.step('Verify every row shows the selected Regime', async () => {
                await expectEveryRowRegimeToBe(salesActionsPage, option.label);
            });

            await test.step(`Verify the other of FTTH-AUSBAU/Bestandsbau is empty`, async () => {
                if (option.expectedInFTTH) {
                    await salesActionsPage.gotoBestandsbauSalesAction();
                } else {
                    await salesActionsPage.gotoFtthSalesAction();
                }
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });

            await test.step('Verify Neubau is empty', async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
    }
});
