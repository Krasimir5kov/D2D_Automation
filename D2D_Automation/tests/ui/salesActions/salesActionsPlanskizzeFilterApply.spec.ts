/**
 * Covers: the Sales Actions Planskizze filter — applying it and verifying results.
 * Trigger: salesActionsPage.planskizzeFilter (#netDocument).
 *
 * Confirmed 2026-09-16 via live DOM: radio-based dropdown, 2 choices ("offen"/"abgeschlossen").
 * FTTH-AUSBAU-only, same shape as Bestellung über D2D — Neubau/Bestandsbau are always empty
 * for either option. Verification is in the side panel's info section, same structural
 * pattern as Bestellung über D2D (a field-label div immediately followed by its status-chip
 * sibling) — text + background color both checked, reusing SIDE_PANEL_CHIP_COLORS
 * (offen -> orange, abgeschlossen -> green).
 *
 * Note: the side panel's own root id is currently `ftth-object-side-panel` — per the user,
 * this is expected to be renamed to something Sales-Action-specific later; not fixed here.
 */
import { test } from '../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { Planskizze } from '../../../src/constants/salesActionSidePanelChipStatus';
import { expectListIsEmptyWithMessageByFilterDropDown, expectTableSettled } from '../../../src/helpers/filterAssertions';
import { SALES_ACTION_FILTER_TITLES_AND_ID } from '../../../src/constants/salesActionFiltersTitle';

test.describe('Sales Actions Planskizze Filter Apply', () => {
    test.describe('Apply offen option and check three different list section results', () => {
        test('FTTH-AUSBAU: Verify that offen option updates list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Open Planskizze filter dropdown', async () => {
                await salesActionsPage.openPlanskizzeFilterDropDown();
            });
            await test.step('Select offen option in Planskizze filter', async () => {
                
                await salesActionsPage.filters.choiceLabelButton(Planskizze['offen']).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(Planskizze['offen'])).toBeChecked();
            });
            await test.step('Apply Planskizze filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.netDocument.label, Planskizze['offen'])).toBeVisible();
            });
            await test.step('Verify that the list items are loaded', async () => {
                await expectTableSettled(salesActionsPage);
            });
            await test.step('Navigate to Sales Action Side Panel', async () => {
                await salesActionsPage.openFirstItemSidePanel();
                await salesActionsPage.expectFtthSalesActionSidePanelOpen();
            });
            await test.step('Check Planskizze status in side panel', async () => {
                await salesActionsPage.checkPlanskizzeStatusInSidePanel(Planskizze['offen']);
            });
            await test.step('Verify colour of the status chip', async () => {
                await salesActionsPage.expectPlanskizzeStatusChipColourToBe(Planskizze['offen']);
            });
        });
        test('NEUBAU: Verify that offen option returns no results', async ({ salesActionsPage }) => {
            await test.step('Navigate to NEUBAU sales action section', async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedNeubau();
            });
            await test.step('Open Planskizze filter dropdown', async () => {
                await salesActionsPage.openPlanskizzeFilterDropDown();
            });
            await test.step('Select offen option in Planskizze filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(Planskizze['offen']).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(Planskizze['offen'])).toBeChecked();
            });
            await test.step('Apply Planskizze filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.netDocument.label, Planskizze['offen'])).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
        test('BESTANDSBAU: Verify that offen option returns no results', async ({ salesActionsPage }) => {
            await test.step('Navigate to BESTANDSBAU sales action section', async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedBestandsbau();
            });
            await test.step('Open Planskizze filter dropdown', async () => {
                await salesActionsPage.openPlanskizzeFilterDropDown();
            });
            await test.step('Select offen option in Planskizze filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(Planskizze['offen']).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(Planskizze['offen'])).toBeChecked();
            });
            await test.step('Apply Planskizze filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.netDocument.label, Planskizze['offen'])).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
    });

    test.describe('Apply abgeschlossen option and check three different list section results', () => {
        test('FTTH-AUSBAU: Verify that abgeschlossen option updates list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Open Planskizze filter dropdown', async () => {
                await salesActionsPage.openPlanskizzeFilterDropDown();
            });
            await test.step('Select abgeschlossen option in Planskizze filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(Planskizze['abgeschlossen']).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(Planskizze['abgeschlossen'])).toBeChecked();
            });
            await test.step('Apply Planskizze filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.netDocument.label, Planskizze['abgeschlossen'])).toBeVisible();
            });
            await test.step('Verify that the list items are loaded', async () => {
                await expectTableSettled(salesActionsPage);
            });
            await test.step('Navigate to Sales Action Side Panel', async () => {
                await salesActionsPage.openFirstItemSidePanel();
                await salesActionsPage.expectFtthSalesActionSidePanelOpen();
            });
            await test.step('Check Planskizze status in side panel', async () => {
                await salesActionsPage.checkPlanskizzeStatusInSidePanel(Planskizze['abgeschlossen']);
            });
            await test.step('Verify colour of the status chip', async () => {
                await salesActionsPage.expectPlanskizzeStatusChipColourToBe(Planskizze['abgeschlossen']);
            });
        });
        test('NEUBAU: Verify that abgeschlossen option returns no results', async ({ salesActionsPage }) => {
            await test.step('Navigate to NEUBAU sales action section', async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedNeubau();
            });
            await test.step('Open Planskizze filter dropdown', async () => {
                await salesActionsPage.openPlanskizzeFilterDropDown();
            });
            await test.step('Select abgeschlossen option in Planskizze filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(Planskizze['abgeschlossen']).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(Planskizze['abgeschlossen'])).toBeChecked();
            });
            await test.step('Apply Planskizze filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.netDocument.label, Planskizze['abgeschlossen'])).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
        test('BESTANDSBAU: Verify that abgeschlossen option returns no results', async ({ salesActionsPage }) => {
            await test.step('Navigate to BESTANDSBAU sales action section', async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedBestandsbau();
            });
            await test.step('Open Planskizze filter dropdown', async () => {
                await salesActionsPage.openPlanskizzeFilterDropDown();
            });
            await test.step('Select abgeschlossen option in Planskizze filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(Planskizze['abgeschlossen']).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(Planskizze['abgeschlossen'])).toBeChecked();
            });
            await test.step('Apply Planskizze filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.netDocument.label, Planskizze['abgeschlossen'])).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
    });
});
