/**
 * Covers: the Sales Actions Ergebnis filter — applying it and verifying results.
 * Trigger: salesActionsPage.ergebnisFilter (#salesActionInteractionResults).
 *
 * TODO: write this test — confirm control type via devtools before writing. See
 * reference-sales-actions-filters and project-sales-actions-filters-apply-progress memory
 * for the confirmed locators and plan.
 */
import { expect } from '@playwright/test';
import { test } from '../../../src/fixtures/object.fixture';
import { SALES_ACTION_FILTER_TITLES_AND_ID } from '../../../src/constants/salesActionFiltersTitle';
import { selectFilterChoiceExpandingAllOptions } from '../../../src/helpers/filterHelpers';
import { ergebnisFilterOptions } from '../../../src/constants/salesActionFiltersValues';
import { expectEveryRowStatusChipToBe, expectListIsEmptyWithMessageByFilterDropDown, expectListIsEmptyWithMessageBySearchInput } from '../../../src/helpers/filterAssertions';
import { SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS } from '../../../src/constants/salesActionsTableChipColors';

test.describe('Sales Actions Ergebnis Filter Apply', () => {
    test('Verify that Neubau-specific Ergebnis filter option updates the list accordingly', async ({ salesActionsPage }) => {
        await test.step('Navigate to Sales Action Page', async () => {
            await salesActionsPage.gotoFtthSalesAction();
            await salesActionsPage.expectLoadedFTTH();
        });
        await test.step('Navigate to Neubau section', async () => {
            await salesActionsPage.gotoNeubauSalesAction();
            await salesActionsPage.expectLoadedNeubau();
        });
        await test.step('Verify that the Ergebnis filter is available and displayed', async () => {
            await expect(salesActionsPage.ergebnisFilter).toBeVisible();
            await expect(salesActionsPage.ergebnisFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionInteractionResults.label);
        });
        await test.step('Select neubau-specific Ergebnis filter option', async () => {
            await selectFilterChoiceExpandingAllOptions(salesActionsPage, () => salesActionsPage.openErgebnisFilterDropDown(), ergebnisFilterOptions.neubauOption);
        });
        await test.step('Apply the Ergebnis filter', async () => {
            await salesActionsPage.filters.applyFilter();
        });
        await test.step('Verify that applied Ergebnis filter chip is displayed', async () => {
            await expect(salesActionsPage.filters.filterBarChip(ergebnisFilterOptions.neubauOption)).toBeVisible();
        });
        await test.step('Verify that the list is updated according to the applied Ergebnis filter', async () => {
            await expectEveryRowStatusChipToBe(salesActionsPage, SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.abgeschlossenNegative.label, SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.abgeschlossenNegative.color);
        });
        await test.step('Verify that FTTH-AUSBAU section is in empty state', async () => {
            await salesActionsPage.gotoFtthSalesAction();
            await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
            await expect(salesActionsPage.table.rows).toHaveCount(0);
        });
        await test.step('Verify that Bestandskunden section is in empty state', async () => {
            await salesActionsPage.gotoBestandsbauSalesAction();
            await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
            await expect(salesActionsPage.table.rows).toHaveCount(0);
        });
    });
    test('Verify FTTH-AUSBAU specific Ergebnis filter option updates the list accordingly', async ({ salesActionsPage }) => {
        await salesActionsPage.gotoFtthSalesAction();
        await salesActionsPage.expectLoadedFTTH();
        await test.step('Verify that the Ergebnis filter is available and displayed', async () => {
            await expect(salesActionsPage.ergebnisFilter).toBeVisible();
            await expect(salesActionsPage.ergebnisFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionInteractionResults.label);
        });
        await test.step('Select FTTH-AUSBAU specific Ergebnis filter option', async () => {
            await selectFilterChoiceExpandingAllOptions(salesActionsPage, () => salesActionsPage.openErgebnisFilterDropDown(), ergebnisFilterOptions.ftthAusbauOption);
        });
        await test.step('Apply the Ergebnis filter', async () => {
            await salesActionsPage.filters.applyFilter();
        });
        await test.step('Verify that applied Ergebnis filter chip is displayed', async () => {
            await expect(salesActionsPage.filters.filterBarChip(ergebnisFilterOptions.ftthAusbauOption)).toBeVisible();
        });
        await test.step('Verify that the list is updated according to the applied Ergebnis filter', async () => {
            await expectEveryRowStatusChipToBe(salesActionsPage, SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.nichtdurchführbar.label, SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.nichtdurchführbar.color);
        });
    });
    test('Verify Bestandsbau-specific Ergebnis filter option updates the list accordingly', async ({ salesActionsPage }) => {
        await salesActionsPage.gotoBestandsbauSalesAction();
        await salesActionsPage.expectLoadedBestandsbau();
        await test.step('Verify that the Ergebnis filter is available and displayed', async () => {
            await expect(salesActionsPage.ergebnisFilter).toBeVisible();
            await expect(salesActionsPage.ergebnisFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionInteractionResults.label);
        });
        await test.step('Select Bestandsbau-specific Ergebnis filter option', async () => {
            await selectFilterChoiceExpandingAllOptions(salesActionsPage, () => salesActionsPage.openErgebnisFilterDropDown(), ergebnisFilterOptions.bestandsbauOption);
        });
        await test.step('Apply the Ergebnis filter', async () => {
            await salesActionsPage.filters.applyFilter();
        });
        await test.step('Verify that applied Ergebnis filter chip is displayed', async () => {
            await expect(salesActionsPage.filters.filterBarChip(ergebnisFilterOptions.bestandsbauOption)).toBeVisible();
        });
        await test.step('Verify that the list is updated according to the applied Ergebnis filter', async () => {
            await expectEveryRowStatusChipToBe(salesActionsPage, SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.abgeschlossenNegative.label, SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.abgeschlossenNegative.color);
        });
    });
});
