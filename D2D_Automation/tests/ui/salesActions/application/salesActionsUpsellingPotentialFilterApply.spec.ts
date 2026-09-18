/**
 * Covers: the Sales Actions "upselling Potential" filter — applying it and verifying results.
 * Trigger: salesActionsPage.upsellingPotentialFilter (#upsellingPotential).
 *
 * Confirmed 2026-09-17: this is a two-option radio filter. Both options return results
 * only in Bestandsbau and render the same house icon; the computed icon color identifies
 * whether Upselling Potential is present or absent.
 */
import { expect } from '@playwright/test';
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { upsellingPotentialFilterOptions } from '../../../../src/constants/salesActionFiltersValues';
import { selectFilterChoiceWithOutSearchInput } from '../../../../src/helpers/filterHelpers';
import {
    expectEveryRowIconToBe,
    expectListIsEmptyWithMessageByFilterDropDown,
} from '../../../../src/helpers/filterAssertions';

test.describe('Sales Actions Upselling Potential Filter Apply', () => {
    for (const option of Object.values(upsellingPotentialFilterOptions)) {
        test(`Apply Upselling Potential option (${option.label}) and verify results across all sections`, async ({ salesActionsPage }) => {
            await test.step('Navigate to the Bestandsbau Sales Actions section', async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await salesActionsPage.expectLoadedBestandsbau();
            });

            await test.step(`Select Upselling Potential option "${option.label}"`, async () => {
                await selectFilterChoiceWithOutSearchInput(
                    salesActionsPage,
                    () => salesActionsPage.openUpsellingPotentialFilterDropDown(),
                    option.label,
                );
                await expect(salesActionsPage.filters.choiceRadio(option.label)).toBeChecked();
            });

            await test.step('Apply the Upselling Potential filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });

            await test.step('Verify the applied-filter chip is visible', async () => {
                await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
            });

            await test.step(`Verify every Bestandsbau row displays the correct "${option.label}" icon`, async () => {
                await expectEveryRowIconToBe(
                    salesActionsPage,
                    salesActionsPage.upsellingPotentialIconInRow,
                    option.expectedIconPresent,
                    'Upselling Potential',
                    option.expectedIconColor,
                );
            });

            await test.step('Verify the FTTH-AUSBAU list is empty', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });

            await test.step('Verify the Neubau list is empty', async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await salesActionsPage.expectLoadedNeubau();
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
    }
});
