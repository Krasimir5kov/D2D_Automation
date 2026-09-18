/**
 * Covers: the Sales Actions "Sales Action-Type" filter — applying it and verifying results.
 * Trigger: salesActionsPage.salesActionTypeFilter (#salesActionType).
 *
 * Confirmed 2026-09-17: the filter uses checkboxes. Objekt Sales Action types return
 * results only in Neubau; D2D Verkauf returns results in every section; A1 Internet
 * Ready Check returns results only in Bestandsbau. Every matching row is verified by
 * its stable data-sales-action-type attribute; the visible type text is Neubau-only.
 */
import { expect } from '@playwright/test';
import { test } from '../../../../src/fixtures/salesAction.fixture';
import {
    representativeObjectSalesActionTypeFilterOptions,
    salesActionTypeFilterOptions,
} from '../../../../src/constants/salesActionFiltersValues';
import { selectFilterChoiceExpandingAllOptions } from '../../../../src/helpers/filterHelpers';
import {
    expectEveryRowSalesActionTypeToBe,
    expectListIsEmptyWithMessageByFilterDropDown,
} from '../../../../src/helpers/filterAssertions';

test.describe('Sales Actions Sales Action-Type Filter Apply', () => {
    for (const option of representativeObjectSalesActionTypeFilterOptions) {
        test(`Apply Objekt Sales Action-Type (${option.label}) and verify results across all sections`, async ({ salesActionsPage }) => {
            await test.step('Navigate to the Neubau Sales Actions section', async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await salesActionsPage.expectLoadedNeubau();
            });

            await test.step(`Select Sales Action-Type option "${option.label}"`, async () => {
                await selectFilterChoiceExpandingAllOptions(
                    salesActionsPage,
                    () => salesActionsPage.openSalesActionTypeFilterDropDown(),
                    option.label,
                );
                await expect(salesActionsPage.filters.choiceCheckbox(option.label)).toBeChecked();
            });

            await test.step('Apply the Sales Action-Type filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });

            await test.step('Verify the applied-filter chip is visible', async () => {
                await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
            });

            await test.step(`Verify every Neubau row has Sales Action-Type "${option.label}"`, async () => {
                await expectEveryRowSalesActionTypeToBe(salesActionsPage, option.label);
            });

            await test.step('Verify the FTTH-AUSBAU list is empty', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });

            await test.step('Verify the Bestandsbau list is empty', async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await salesActionsPage.expectLoadedBestandsbau();
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
    }

    test('Apply D2D Verkauf and verify matching rows in all sections', async ({ salesActionsPage }) => {
        const option = salesActionTypeFilterOptions.d2dVerkauf;

        await test.step('Navigate to the Neubau Sales Actions section', async () => {
            await salesActionsPage.gotoNeubauSalesAction();
            await salesActionsPage.expectLoadedNeubau();
        });

        await test.step(`Select Sales Action-Type option "${option.label}"`, async () => {
            await selectFilterChoiceExpandingAllOptions(
                salesActionsPage,
                () => salesActionsPage.openSalesActionTypeFilterDropDown(),
                option.label,
            );
            await expect(salesActionsPage.filters.choiceCheckbox(option.label)).toBeChecked();
        });

        await test.step('Apply the Sales Action-Type filter', async () => {
            await salesActionsPage.filters.applyFilter();
        });

        await test.step('Verify the applied-filter chip is visible', async () => {
            await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
        });

        await test.step('Verify every Neubau row has Sales Action-Type D2D Verkauf', async () => {
            await expectEveryRowSalesActionTypeToBe(salesActionsPage, option.label);
        });

        await test.step('Verify every FTTH-AUSBAU row has Sales Action-Type D2D Verkauf', async () => {
            await salesActionsPage.gotoFtthSalesAction();
            await salesActionsPage.expectLoadedFTTH();
            await expectEveryRowSalesActionTypeToBe(salesActionsPage, option.label);
        });

        await test.step('Verify every Bestandsbau row has Sales Action-Type D2D Verkauf', async () => {
            await salesActionsPage.gotoBestandsbauSalesAction();
            await salesActionsPage.expectLoadedBestandsbau();
            await expectEveryRowSalesActionTypeToBe(salesActionsPage, option.label);
        });
    });

    test('Apply A1 Internet Ready Check and verify results across all sections', async ({ salesActionsPage }) => {
        const option = salesActionTypeFilterOptions.a1InternetReadyCheck;

        await test.step('Navigate to the Bestandsbau Sales Actions section', async () => {
            await salesActionsPage.gotoBestandsbauSalesAction();
            await salesActionsPage.expectLoadedBestandsbau();
        });

        await test.step(`Select Sales Action-Type option "${option.label}"`, async () => {
            await selectFilterChoiceExpandingAllOptions(
                salesActionsPage,
                () => salesActionsPage.openSalesActionTypeFilterDropDown(),
                option.label,
            );
            await expect(salesActionsPage.filters.choiceCheckbox(option.label)).toBeChecked();
        });

        await test.step('Apply the Sales Action-Type filter', async () => {
            await salesActionsPage.filters.applyFilter();
        });

        await test.step('Verify the applied-filter chip is visible', async () => {
            await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
        });

        await test.step('Verify every Bestandsbau row has Sales Action-Type A1 Internet Ready Check', async () => {
            await expectEveryRowSalesActionTypeToBe(salesActionsPage, option.label);
        });

        await test.step('Verify the Neubau list is empty', async () => {
            await salesActionsPage.gotoNeubauSalesAction();
            await salesActionsPage.expectLoadedNeubau();
            await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
            await expect(salesActionsPage.table.rows).toHaveCount(0);
        });

        await test.step('Verify the FTTH-AUSBAU list is empty', async () => {
            await salesActionsPage.gotoFtthSalesAction();
            await salesActionsPage.expectLoadedFTTH();
            await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
            await expect(salesActionsPage.table.rows).toHaveCount(0);
        });
    });
});
