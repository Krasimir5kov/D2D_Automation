/**
 * Covers: the Sales Actions Kundendaten filter — applying it and verifying results.
 * Trigger: salesActionsPage.kundendatenFilter (#customerData).
 *
 * TODO: confirm control type via devtools before trusting the choiceRadio() usage below —
 * assumed radio-based by analogy with Bestellung über D2D's identical "erfasst"/"nicht
 * erfasst" shape, never independently checked for this specific filter.
 */
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { KundendatenFilterOptions } from '../../../../src/constants/salesActionFiltersValues';
import { selectFilterChoiceExpandingAllOptions, selectFilterChoiceWithOutSearchInput } from '../../../../src/helpers/filterHelpers';
import { expectEveryRowIconToBe, expectListIsEmptyWithMessageByFilterDropDown } from '../../../../src/helpers/filterAssertions';

test.describe('Sales Actions Kundendaten Filter Apply', () => {
    for (const option of Object.values(KundendatenFilterOptions)) {
        test(`Apply Kundendaten filter option (${option.label}) and verify results across all sections`, async ({ salesActionsPage }) => {
            await test.step('Navigate to FTTH-AUSBAU section', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step(`Select Kundendaten option "${option.label}"`, async () => {
                await selectFilterChoiceWithOutSearchInput(salesActionsPage, () => salesActionsPage.openKundendatenFilterDropDown(), option.label);
                await expect(salesActionsPage.filters.choiceRadio(option.label)).toBeChecked();
            });
            await test.step('Apply the filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify chip is visible', async () => {
                await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
            });
            await test.step('Verify FTTH-AUSBAU shows matching rows', async () => {
                await expectEveryRowIconToBe(salesActionsPage, salesActionsPage.kundendatenIconInRow, option.expectedIconPresent, 'Kundendaten');
            });

            await test.step(`Verify Bestandsbau ${option.expectedInBestandsbau ? 'shows matching rows' : 'is empty'}`, async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                if (option.expectedInBestandsbau) {
                    await salesActionsPage.expectLoadedBestandsbau();
                    await expectEveryRowIconToBe(salesActionsPage, salesActionsPage.kundendatenIconInRow, option.expectedIconPresent, 'Kundendaten');
                } else {
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                }
            });

            await test.step(`Verify Neubau ${option.expectedInNeubau ? 'shows matching rows' : 'is empty'}`, async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                if (option.expectedInNeubau) {
                    await salesActionsPage.expectLoadedNeubau();
                    await expectEveryRowIconToBe(salesActionsPage, salesActionsPage.kundendatenIconInRow, option.expectedIconPresent, 'Kundendaten');
                } else {
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                }
            });
        });
    }
});
