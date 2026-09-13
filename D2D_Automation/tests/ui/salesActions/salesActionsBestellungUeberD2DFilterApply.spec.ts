/**
 * Covers: the Sales Actions "Bestellung über D2D" filter — applying it and verifying results.
 * Trigger: salesActionsPage.bestellungUeberD2DFilter (#hybrisOrder).
 *
 * TODO: write this test — confirm control type via devtools before writing. See
 * reference-sales-actions-filters and project-sales-actions-filters-apply-progress memory
 * for the confirmed locators and plan.
 */
import { BestellungUeberD2DOptions } from '../../../src/constants/salesActionSidePanelChipStatus';
import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';
import { expectListIsEmptyWithMessageByFilterDropDown, expectListIsEmptyWithMessageBySearchInput, expectListIsNotEmpty, expectTableSettled, nearestNonTransparentBackgroundColor } from '../../../src/helpers/filterAssertions';
import { applyFilterAndWaitForResults } from '../../../src/helpers/filterHelpers';
import { SIDE_PANEL_CHIP_COLORS } from '../../../src/constants/salesActionSidePanelChipColors';
import { SALES_ACTION_FILTER_TITLES_AND_ID } from '../../../src/constants/salesActionFiltersTitle';

test.describe('Sales Actions Bestellung über D2D Filter Apply', () => {
    test.beforeEach(async ({ salesActionsPage }) => {
        await salesActionsPage.goToSalesActionPage();
        await salesActionsPage.expectLoadedSalesAction();
    });
    test.describe('Apply nicht erfasst option and check three different list section results', () => {
        test('FTTH-AUSBAU:Verify that nicht erfasst option update list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Open Bestellung über D2D filter dropdown', async () => {
                await salesActionsPage.openBestellungUeberD2DFilterDropDown();
            });
            await test.step('Select nicht erfasst option in Bestellung über D2D filter', async () => {
                await salesActionsPage.nichtErfasstRadioOptionInBestellungUeberD2DFilter.click();
                // Add assertions here to verify that the list items are updated accordingly
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(BestellungUeberD2DOptions['non-recorded'])).toBeChecked();
            });
            await test.step('Apply Bestellung über D2D filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.hybrisOrder.label, BestellungUeberD2DOptions['non-recorded'])).toBeVisible();
            });
            await test.step('Navigate to FTTH-AUSBAU section list items', async () => {
                await salesActionsPage.gotoFtthSalesAction();
            });
            await test.step('Verify that the list items are loaded', async () => {
                await expectTableSettled(salesActionsPage);
            });
            await test.step('Navigate to Sales Action Side Panel', async () => {
                await salesActionsPage.openFirstItemSidePanel();
            });
            await test.step('Verify that the side panel is opened', async () => {
                await expect(salesActionsPage.aktvititenSidePanelSection).toBeVisible();
            });

            await test.step('Check Bestellung über D2D status in side panel', async () => {
                await salesActionsPage.checkBestellungUeberD2DStatusInSidePanel(BestellungUeberD2DOptions['non-recorded']);
            });
            await test.step('Verify colour of the status chip', async () => {
                await salesActionsPage.expectBestellungUeberD2DStatusChipColour(
                    BestellungUeberD2DOptions['non-recorded'],
                );
            });
        });
        test('NEUBAU:Verify that nicht erfasst option returns no results', async ({ salesActionsPage }) => {
            await test.step("Navigate to NEUBAU sales action section", async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedNeubau();
                await expectListIsNotEmpty(salesActionsPage);
            });
            await test.step('Open Bestellung über D2D filter dropdown and verify that it is opened', async () => {
                await salesActionsPage.openBestellungUeberD2DFilterDropDown();
            });
            await test.step('Selecting nicht erfasst option in Bestellung über D2D filter', async () => {
                await salesActionsPage.nichtErfasstRadioOptionInBestellungUeberD2DFilter.click();
            });

            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(BestellungUeberD2DOptions['non-recorded'])).toBeChecked();
            });
            await test.step('Apply Bestellung über D2D filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.hybrisOrder.label, BestellungUeberD2DOptions['non-recorded'])).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
            });
        });
        test('BESTANDSBAU:Verify that nicht erfasst option returns no results', async ({ salesActionsPage }) => {
            await test.step("Navigate to BESTANDSBAU sales action section", async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedBestandsbau();
                await expectListIsNotEmpty(salesActionsPage);
            });
            await test.step('Open Bestellung über D2D filter dropdown and verify that it is opened', async () => {
                await salesActionsPage.openBestellungUeberD2DFilterDropDown();
            });
            await test.step('Selecting nicht erfasst option in Bestellung über D2D filter', async () => {
                await salesActionsPage.nichtErfasstRadioOptionInBestellungUeberD2DFilter.click();
            });

            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(BestellungUeberD2DOptions['non-recorded'])).toBeChecked();
            });
            await test.step('Apply Bestellung über D2D filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.hybrisOrder.label, BestellungUeberD2DOptions['non-recorded'])).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
            });
        });
    });
    test.describe('Apply erfasst option and check three different list section results', () => {
        test('FTTH-AUSBAU:Verify that nicht erfasst option update list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Open Bestellung über D2D filter dropdown', async () => {
                await salesActionsPage.openBestellungUeberD2DFilterDropDown();
            });
            await test.step('Select erfasst option in Bestellung über D2D filter', async () => {
                await salesActionsPage.erfasstRadioOptionInBestellungUeberD2DFilter.click();
                // Add assertions here to verify that the list items are updated accordingly
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(BestellungUeberD2DOptions['recorded'])).toBeChecked();
            });
            await test.step('Apply Bestellung über D2D filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.hybrisOrder.label, BestellungUeberD2DOptions['recorded'])).toBeVisible();
            });
            await test.step('Navigate to FTTH-AUSBAU section list items', async () => {
                await salesActionsPage.gotoFtthSalesAction();
            });
            await test.step('Verify that the list items are loaded', async () => {
                await expectTableSettled(salesActionsPage);
            });
            await test.step('Navigate to Sales Action Side Panel', async () => {
                await salesActionsPage.openFirstItemSidePanel();
            });
            await test.step('Verify that the side panel is opened', async () => {
                await expect(salesActionsPage.aktvititenSidePanelSection).toBeVisible();
            });

            await test.step('Check Bestellung über D2D status in side panel', async () => {
                await salesActionsPage.checkBestellungUeberD2DStatusInSidePanel(BestellungUeberD2DOptions['recorded']);
            });
            await test.step('Verify colour of the status chip', async () => {
                await salesActionsPage.expectBestellungUeberD2DStatusChipColour(
                    BestellungUeberD2DOptions['recorded'],
                );
            });
        });
        test('NEUBAU:Verify that erfasst option returns no results', async ({ salesActionsPage }) => {
            await test.step("Navigate to NEUBAU sales action section", async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedNeubau();
                await expectListIsNotEmpty(salesActionsPage);
            });
            await test.step('Open Bestellung über D2D filter dropdown and verify that it is opened', async () => {
                await salesActionsPage.openBestellungUeberD2DFilterDropDown();
            });
            await test.step('Selecting erfasst option in Bestellung über D2D filter', async () => {
                await salesActionsPage.erfasstRadioOptionInBestellungUeberD2DFilter.click();
            });

            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(BestellungUeberD2DOptions['recorded'])).toBeChecked();
            });
            await test.step('Apply Bestellung über D2D filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.hybrisOrder.label, BestellungUeberD2DOptions['recorded'])).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
            });
        });
        test('BESTANDSBAU:Verify that erfasst option returns no results', async ({ salesActionsPage }) => {
            await test.step("Navigate to BESTANDSBAU sales action section", async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedBestandsbau();
                await expectListIsNotEmpty(salesActionsPage);
            });
            await test.step('Open Bestellung über D2D filter dropdown and verify that it is opened', async () => {
                await salesActionsPage.openBestellungUeberD2DFilterDropDown();
            });
            await test.step('Selecting erfasst option in Bestellung über D2D filter', async () => {
                await salesActionsPage.erfasstRadioOptionInBestellungUeberD2DFilter.click();
            });

            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(BestellungUeberD2DOptions['recorded'])).toBeChecked();
            });
            await test.step('Apply Bestellung über D2D filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.hybrisOrder.label, BestellungUeberD2DOptions['recorded'])).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
            });
        });
    });

    });
