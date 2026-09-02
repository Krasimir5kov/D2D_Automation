/**
 * Covers: a smoke check that every Sales Actions filter trigger is visible on the
 * FTTH-Ausbau filter bar, and shows the correct title. Does not apply any filter or
 * verify results — that's covered per-filter in the dedicated *FilterApply.spec.ts files.
 * See reference-sales-actions-filters memory for the confirmed trigger ids this list is
 * built from, and salesActionFiltersTitle.ts for the id-to-label mapping.
 */
import { test } from '../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { SALES_ACTION_FILTER_TITLES_AND_ID } from '../../../src/constants/salesActionFiltersTitle';

test.describe('Sales Actions Filters Availability', () => {
    test('Verify that all Sales Actions filters are displayed with the correct title', async ({ salesActionsPage }) => {
        await test.step('Navigate to Sales Action Page', async () => {
            await salesActionsPage.gotoFtthSalesAction();
            await salesActionsPage.expectLoadedFTTH();
        });
        await test.step('Verify Baulos/Einsatzname filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.baulosEinsatznameFilter).toBeVisible();
            await expect(salesActionsPage.baulosEinsatznameFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.contractSection.label);
        });
        await test.step('Verify Organisation filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.filters.organisationFilter).toBeVisible();
            await expect(salesActionsPage.filters.organisationFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.organizations.label);
        });
        await test.step('Verify Regime filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.regimeFilter).toBeVisible();
            await expect(salesActionsPage.regimeFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionObjectSubType.label);
        });
        await test.step('Verify Phase filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.phaseFilter).toBeVisible();
            await expect(salesActionsPage.phaseFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.contractSectionPhaseAdmins.label);
        });
        await test.step('Verify Termin filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.terminFilter).toBeVisible();
            await expect(salesActionsPage.terminFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.appointment.label);
        });
        await test.step('Verify Immobilienart filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.immobilienartFilter).toBeVisible();
            await expect(salesActionsPage.immobilienartFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionPropertyType.label);
        });
        await test.step('Verify Status filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.statusFilter).toBeVisible();
            await expect(salesActionsPage.statusFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionStatus.label);
        });
        await test.step('Verify Aufgabe filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.aufgabeFilter).toBeVisible();
            await expect(salesActionsPage.aufgabeFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionTasks.label);
        });
        await test.step('Verify Ergebnis filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.ergebnisFilter).toBeVisible();
            await expect(salesActionsPage.ergebnisFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionInteractionResults.label);
        });
        await test.step('Verify Planskizze filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.planskizzeFilter).toBeVisible();
            await expect(salesActionsPage.planskizzeFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.netDocument.label);
        });
        await test.step('Verify Bestellung über D2D filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.bestellungUeberD2DFilter).toBeVisible();
            await expect(salesActionsPage.bestellungUeberD2DFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.hybrisOrder.label);
        });
        await test.step('Verify Ableger Zustimmung filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.ablegerZustimmungFilter).toBeVisible();
            await expect(salesActionsPage.ablegerZustimmungFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.zustNetdocDocument.label);
        });
        await test.step('Verify Kundendaten filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.kundendatenFilter).toBeVisible();
            await expect(salesActionsPage.kundendatenFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.customerData.label);
        });
        await test.step('Verify Sales Action-Type filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.salesActionTypeFilter).toBeVisible();
            await expect(salesActionsPage.salesActionTypeFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionType.label);
        });
        await test.step('Verify Objekt filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.objektFilter).toBeVisible();
            await expect(salesActionsPage.objektFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionLocationResults.label);
        });
        await test.step('Verify zugewiesen an filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.zugewiesenAnFilter).toBeVisible();
            await expect(salesActionsPage.zugewiesenAnFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.salesActionsAssigneesSearch.label);
        });
        await test.step('Verify upselling Potential filter is displayed with the correct title', async () => {
            await expect(salesActionsPage.upsellingPotentialFilter).toBeVisible();
            await expect(salesActionsPage.upsellingPotentialFilter).toHaveText(SALES_ACTION_FILTER_TITLES_AND_ID.upsellingPotential.label);
        });
    });
});
