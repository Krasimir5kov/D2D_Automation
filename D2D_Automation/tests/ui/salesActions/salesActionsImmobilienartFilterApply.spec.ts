/**
 * Covers: the Sales Actions Immobilienart filter — applying it and verifying results.
 * Trigger: salesActionsPage.immobilienartFilter (#salesActionPropertyType).
 *
 * TODO: write this test — confirm control type via devtools before writing. See
 * reference-sales-actions-filters and project-sales-actions-filters-apply-progress memory
 * for the confirmed locators and plan.
 */
import { test } from '../../../src/fixtures/salesAction.fixture';
import { immobilienartFilterOptions } from '../../../src/constants/salesActionFiltersValues';
import { selectFilterChoiceExpandingAllOptions, selectFilterChoiceWithOutSearchInput } from '../../../src/helpers/filterHelpers';
import { expect } from '@playwright/test';
import { expectListIsEmptyWithMessageByFilterDropDown } from '../../../src/helpers/filterAssertions';

test.describe('Sales Actions Immobilienart Filter Apply', () => {
    for (const option of Object.values(immobilienartFilterOptions)) {
        test(`Apply Immobilienart filter for option: ${option.label} and verify results across all sections`, async ({ salesActionsPage }) => {
            await test.step('Navigate to FTTH-AUSBAU section', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step(`Select Immobilienart option: ${option.label}`, async () => {
                await selectFilterChoiceWithOutSearchInput(salesActionsPage, () => salesActionsPage.openImmobilienartFilterDropDown(), option.label);
            });
            await test.step('Apply the fitler', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify chip is visible', async () => {
                await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
            });
            await test.step('Verify FTTH-AUSBAU shows matching rows', async () => {
                await expect(salesActionsPage.table.loadingCells).toHaveCount(0);
                await expect(salesActionsPage.table.rows).not.toHaveCount(0);
                // row-check — see blocker below
            });
             await test.step(`Verify Bestandsbau ${option.expectedInBestandsbau ? 'shows matching rows' : 'is empty'}`, async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                if (option.expectedInBestandsbau) {
                    await salesActionsPage.expectLoadedBestandsbau();
                    await expect(salesActionsPage.table.loadingCells).toHaveCount(0);
                    await expect(salesActionsPage.table.rows).not.toHaveCount(0);
                    // row-check — see blocker below
                } else {
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                }
            });

            await test.step(`Verify Neubau ${option.expectedNEUBAU ? 'shows matching rows' : 'is empty'}`, async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                if (option.expectedNEUBAU) {
                    await salesActionsPage.expectLoadedNeubau();
                    await expect(salesActionsPage.table.loadingCells).toHaveCount(0);
                    await expect(salesActionsPage.table.rows).not.toHaveCount(0);
                    // row-check — see blocker below
                } else {
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                }
            });
        });
    }
        
});
