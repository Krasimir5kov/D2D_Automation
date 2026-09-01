/**
 * Covers: the Sales Actions "Ableger Zustimmung" filter — applying it and verifying results.
 * Trigger: salesActionsPage.ablegerZustimmungFilter (#zustNetdocDocument).
 *
 * TODO: write this test — confirm control type via devtools before writing. See
 * reference-sales-actions-filters and project-sales-actions-filters-apply-progress memory
 * for the confirmed locators and plan.
 */
import { test } from '../../../src/fixtures/salesAction.fixture';
import { ablegerZustimmungOptions, ablegerZustimmungsdokumentOptions } from '../../../src/constants/salesActionFiltersValues';
import { expect } from '@playwright/test';
import { expectTableSettled } from '../../../src/helpers/filterAssertions';
import { salesActionPhaseValues } from '../../../src/constants/salesActionPhaseValues';

test.describe('Sales Actions Ableger Zustimmung Filter Apply', () => {
    test.describe('Ableger Zustimmung Filter Apply', () => {
        test("Verify that filter section provide both Ableger options'", async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async ({ }) => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Verify that filter is available and displayed', async ({ }) => {
                await salesActionsPage.expectAblegerZustimmungFilterDisplayed();
            });
            await test.step('Open Ableger Zustimmung Filter DropDown', async ({ }) => {
                await salesActionsPage.openAblegerZustimmungFilterDropDown();
            });
            await test.step("Verify that 'Ableger Zustimmung' filter option is available and displayed", async ({ }) => {
                await salesActionsPage.expectAblegerAbgelehntFilterOptionDisplayed(ablegerZustimmungOptions.ablegerZugestimmt);
            });
            await test.step("Verify that 'Ableger Abgelehnt' filter option is available and displayed", async ({ }) => {
                await salesActionsPage.expectAblegerAbgelehntFilterOptionDisplayed(ablegerZustimmungOptions.ablegerAbgelehnt);
            });
        });
        test('Verify Ableger Abgelehnt filter option update list accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Verify that filter is available and displayed', async () => {
                await salesActionsPage.expectAblegerZustimmungFilterDisplayed();
            });
            await test.step('Open Ableger Zustimmung Filter DropDown', async () => {
                await salesActionsPage.openAblegerZustimmungFilterDropDown();
            });
            await test.step("Verify that 'Ableger Abgelehnt' filter option is available and displayed", async () => {
                await salesActionsPage.expectAblegerAbgelehntFilterOptionDisplayed(ablegerZustimmungOptions.ablegerAbgelehnt);
            });
            await test.step("Select 'Ableger Abgelehnt' option and apply filter", async () => {
                await salesActionsPage.selectAblegerAbgelehntOptionAndApplyFilter(ablegerZustimmungOptions.ablegerAbgelehnt);
            });
            await test.step("Verify that list items are updated accordingly by opening SA Side panel", async () => {
                await expectTableSettled(salesActionsPage);
                await expect(salesActionsPage.table.loadingCells).toHaveCount(0);
                await salesActionsPage.openFirstItemSidePanel();
                await salesActionsPage.expectFtthSalesActionSidePanelOpen();
            });
            await test.step('Verify that the AKTIVITATEN section is visible', async () => {
                await expect(salesActionsPage.aktvititenSidePanelSection).toBeVisible();
            });
            await test.step('Opening AKTIVITATEN section', async () => {
                await salesActionsPage.openAktivitenSidePanelSection();
            });
            await test.step("Open Customer Interaction Accordion", async () => {
                await salesActionsPage.openFirstCustomerInteractionAccordion();
            });
            await test.step("Verify Customer Interaction Accordion is opened and displays the correct information", async () => {
                await expect(salesActionsPage.accordionBodyContent.getByText('Ableger Zustimmung').first()).toBeVisible();
                await expect(salesActionsPage.accordionBodyContent.getByText('Ableger Abgelehnt').first()).toBeVisible();
                await salesActionsPage.expectCustomerInteractionAccordionOpened();
            });

        });
        test('Verify Ableger Zugestimmt filter option update list accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Verify that filter is available and displayed', async () => {
                await salesActionsPage.expectAblegerZustimmungFilterDisplayed();
            });
            await test.step('Open Ableger Zustimmung Filter DropDown', async () => {
                await salesActionsPage.openAblegerZustimmungFilterDropDown();
            });
            await test.step("Verify that 'Ableger Zustimmung' filter option is available and displayed", async () => {
                await salesActionsPage.expectAblegerAbgelehntFilterOptionDisplayed(ablegerZustimmungOptions.ablegerZugestimmt);
            });
            await test.step("Select 'Ableger Zustimmung' option and apply filter", async () => {
                await salesActionsPage.selectAblegerAbgelehntOptionAndApplyFilter(ablegerZustimmungOptions.ablegerZugestimmt);
            });
            await test.step("Verify that list items are updated accordingly by opening SA Side panel", async () => {
                await expectTableSettled(salesActionsPage);
                await expect(salesActionsPage.table.loadingCells).toHaveCount(0);
                await salesActionsPage.openFirstItemSidePanel();
                await salesActionsPage.expectFtthSalesActionSidePanelOpen();
            });

        });
        test('Verify that nicht Erfasst filter option update list accordingly and not presente if SA is not in 2ndRun', async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Verify that filter is available and displayed', async () => {
                await salesActionsPage.expectAblegerZustimmungFilterDisplayed();
            });
            await test.step('Open Ableger Zustimmung Filter DropDown', async () => {
                await salesActionsPage.openAblegerZustimmungFilterDropDown();
            });
            await test.step("Verify that 'nicht Erfasst' filter option is available and displayed", async () => {
                await salesActionsPage.expectAblegerAbgelehntFilterOptionDisplayed(ablegerZustimmungsdokumentOptions.nichtErfasst);
            });
            await test.step("Select 'nicht Erfasst' option and apply filter", async () => {
                await salesActionsPage.selectAblegerAbgelehntOptionAndApplyFilter(ablegerZustimmungsdokumentOptions.nichtErfasst);
            });
            await test.step("Verify that list items are updated accordingly by opening SA Side panel", async () => {
                await expectTableSettled(salesActionsPage);
                await expect(salesActionsPage.table.loadingCells).toHaveCount(0);
                await salesActionsPage.openFirstItemSidePanel();
                await salesActionsPage.expectFtthSalesActionSidePanelOpen();
            });
            await test.step("Verify that SA is not in 2nd Run Phase", async () => {
                await expect(salesActionsPage.phaseChipInSidePanelHeader(salesActionPhaseValues.secondRun)).not.toBeVisible();
            });
            await test.step("Verify that 'Ableger Zustimmung' chip and header is not present in Side Panel", async () => {
                await expect(salesActionsPage.ablegerErfasstChipInSidePanel).not.toBeVisible();
            });
        });
        test('Verify that erfasst filter option update list accordingly, chip is presented regardless of SA Phase', async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Verify that filter is available and displayed', async () => {
                await salesActionsPage.expectAblegerZustimmungFilterDisplayed();
            });
            await test.step("Select 'erfasst' option and apply filter", async () => {
                await salesActionsPage.openAblegerZustimmungFilterDropDown();
                await salesActionsPage.genericDropdownMenuOption.getByText(ablegerZustimmungsdokumentOptions.erfasst,{exact: true}).click();
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Apply 2ndRun Phase filter to verify that chip is present regardless of SA Phase', async () => {
                await salesActionsPage.openPhaseFilterDropDown();
                await salesActionsPage.genericDropdownMenuOption.getByText(salesActionPhaseValues.secondRun,{exact: true}).click();
                await salesActionsPage.filters.applyFilter();
               
            });
            await test.step("Verify that list items are updated accordingly by opening SA Side panel", async () => {
                await expectTableSettled(salesActionsPage);
                await expect(salesActionsPage.table.loadingCells).toHaveCount(0);
                await salesActionsPage.openFirstItemSidePanel();
                await salesActionsPage.expectFtthSalesActionSidePanelOpen();
            });
            await test.step("Verify that 'Ableger Zustimmung' chip is present in Side Panel regardless of SA Phase", async () => {
                await expect(salesActionsPage.ablegerErfasstChipInSidePanel).toBeVisible();
            });
        });
    });
});


