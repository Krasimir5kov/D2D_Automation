/**
 * Covers: the Sales Actions Organisation filter — applying it and verifying results.
 * Trigger: shared #organizations id, same as Baulose/Objekte — reachable via
 * salesActionsPage.filters.organisationFilter (see FilterBar.ts), no new locator needed.
 *
 * Confirmed 2026-09-15 via live row DOM: unlike Objekte (dedicated td[id$='-organisation']
 * cell), Sales Actions has no dedicated Organisation column — the org/team name renders
 * inside the "zugewiesen an" (assigned-to) cell, in its own stable div, alongside content
 * that varies row to row (1-3 assignee name lines above it, an optional "(übergeben)"
 * suffix below it) — see organisationInRow() on SalesActionsPage.ts. Scoping to that
 * specific div, rather than reading the whole cell's text, is what keeps this correct
 * regardless of that surrounding variation.
 */
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { getFirstRowSalesActionOrganisation } from '../../../../src/helpers/filterHelpers';
import { expectEveryRowOrEmptyState, expectEveryRowSalesActionOrganisationToBe } from '../../../../src/helpers/filterAssertions';

test.describe('Sales Actions Organisation Filter Apply', () => {
    let name = '';

    test('FTTH-AUSBAU: Filtering by the first row\'s Organisation shows only matching rows', async ({ salesActionsPage }) => {
        await test.step('Navigate to FTTH-AUSBAU section', async () => {
            await salesActionsPage.gotoFtthSalesAction();
            await salesActionsPage.expectLoadedFTTH();
        });
        await test.step('Get the first row\'s Organisation value', async () => {
            name = await getFirstRowSalesActionOrganisation(salesActionsPage);
        });
        await test.step('Open the Organisation filter and select the first row\'s Organisation value', async () => {
            await salesActionsPage.filters.organisationFilterOpen();
            await salesActionsPage.filters.expectDropdownOpened();
            await salesActionsPage.filters.dropDownSearchInput.fill(name);
            await salesActionsPage.filters.choiceLabelButton(name).click();
            await expect(salesActionsPage.filters.choiceCheckbox(name)).toBeChecked();
        });
        await test.step('Apply the filter', async () => {
            await salesActionsPage.filters.applyFilter();
        });
        await test.step('Verify chip is visible', async () => {
            await expect(salesActionsPage.filters.filterBarChip(name)).toBeVisible();
        });
        await test.step('Verify every row shows the selected Organisation', async () => {
            await expectEveryRowSalesActionOrganisationToBe(salesActionsPage, name);
        });
    });

    test('BESTANDSBAU: Filtering by the first row\'s Organisation shows only matching rows', async ({ salesActionsPage }) => {
        await test.step('Navigate to Bestandsbau section', async () => {
            await salesActionsPage.gotoBestandsbauSalesAction();
            await salesActionsPage.expectLoadedBestandsbau();
        });
        await test.step('Get the first row\'s Organisation value', async () => {
            name = await getFirstRowSalesActionOrganisation(salesActionsPage);
        });
        await test.step('Open the Organisation filter and select the first row\'s Organisation value', async () => {
            await salesActionsPage.filters.organisationFilterOpen();
            await salesActionsPage.filters.expectDropdownOpened();
            await salesActionsPage.filters.dropDownSearchInput.fill(name);
            await salesActionsPage.filters.choiceLabelButton(name).click();
            await expect(salesActionsPage.filters.choiceCheckbox(name)).toBeChecked();
        });
        await test.step('Apply the filter', async () => {
            await salesActionsPage.filters.applyFilter();
        });
        await test.step('Verify chip is visible', async () => {
            await expect(salesActionsPage.filters.filterBarChip(name)).toBeVisible();
        });
        await test.step('Verify every row shows the selected Organisation', async () => {
            await expectEveryRowSalesActionOrganisationToBe(salesActionsPage, name);
        });
    });

    test('NEUBAU: Filtering by the first row\'s Organisation shows only matching rows', async ({ salesActionsPage }) => {
        await test.step('Navigate to Neubau section', async () => {
            await salesActionsPage.gotoNeubauSalesAction();
            await salesActionsPage.expectLoadedNeubau();
        });
        await test.step('Get the first row\'s Organisation value', async () => {
            name = await getFirstRowSalesActionOrganisation(salesActionsPage);
        });
        await test.step('Open the Organisation filter and select the first row\'s Organisation value', async () => {
            await salesActionsPage.filters.organisationFilterOpen();
            await salesActionsPage.filters.expectDropdownOpened();
            await salesActionsPage.filters.dropDownSearchInput.fill(name);
            await salesActionsPage.filters.choiceLabelButton(name).click();
            await expect(salesActionsPage.filters.choiceCheckbox(name)).toBeChecked();
        });
        await test.step('Apply the filter', async () => {
            await salesActionsPage.filters.applyFilter();
        });
        await test.step('Verify chip is visible', async () => {
            await expect(salesActionsPage.filters.filterBarChip(name)).toBeVisible();
        });
        await test.step('Verify every row shows the selected Organisation', async () => {
            await expectEveryRowSalesActionOrganisationToBe(salesActionsPage, name);
        });
    });
});
