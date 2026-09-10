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
import { expectTableSettled, nearestNonTransparentBackgroundColor } from '../../../src/helpers/filterAssertions';
import { applyFilterAndWaitForResults } from '../../../src/helpers/filterHelpers';
import { SIDE_PANEL_CHIP_COLORS } from '../../../src/constants/salesActionSidePanelChipColors';

test.describe('Sales Actions Bestellung über D2D Filter Apply', () => {
    test('Verify that nicht erfasst option update list items accordingly', async ({ salesActionsPage }) => {
        await test.step('Navigate to Sales actions page', async () => {
            await salesActionsPage.goToSalesActionPage();
            await salesActionsPage.expectLoadedSalesAction();
            // Add assertions here to verify that the list items are updated accordingly
        });
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
});
