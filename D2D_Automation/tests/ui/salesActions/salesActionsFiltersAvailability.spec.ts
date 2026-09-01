/**
 * Covers: a smoke check that every Sales Actions filter trigger is visible on the
 * FTTH-Ausbau filter bar. Does not apply any filter or verify results — that's covered
 * per-filter in the dedicated *FilterApply.spec.ts files. See reference-sales-actions-filters
 * memory for the confirmed trigger ids this list is built from.
 */
import { test } from '../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';

test.describe('Sales Actions Filters Availability', () => {
    test('Verify that all Sales Actions filters are displayed', async ({ salesActionsPage }) => {
        await test.step('Navigate to Sales Action Page', async () => {
            await salesActionsPage.gotoFtthSalesAction();
            await salesActionsPage.expectLoadedFTTH();
        });
        await test.step('Verify Baulos/Einsatzname filter is displayed', async () => {
            await expect(salesActionsPage.baulosEinsatznameFilter).toBeVisible();
        });
        await test.step('Verify Organisation filter is displayed', async () => {
            await expect(salesActionsPage.filters.organisationFilter).toBeVisible();
        });
        await test.step('Verify Regime filter is displayed', async () => {
            await expect(salesActionsPage.regimeFilter).toBeVisible();
        });
        await test.step('Verify Phase filter is displayed', async () => {
            await expect(salesActionsPage.phaseFilter).toBeVisible();
        });
        await test.step('Verify Termin filter is displayed', async () => {
            await expect(salesActionsPage.terminFilter).toBeVisible();
        });
        await test.step('Verify Immobilienart filter is displayed', async () => {
            await expect(salesActionsPage.immobilienartFilter).toBeVisible();
        });
        await test.step('Verify Status filter is displayed', async () => {
            await expect(salesActionsPage.statusFilter).toBeVisible();
        });
        await test.step('Verify Aufgabe filter is displayed', async () => {
            await expect(salesActionsPage.aufgabeFilter).toBeVisible();
        });
        await test.step('Verify Ergebnis filter is displayed', async () => {
            await expect(salesActionsPage.ergebnisFilter).toBeVisible();
        });
        await test.step('Verify Planskizze filter is displayed', async () => {
            await expect(salesActionsPage.planskizzeFilter).toBeVisible();
        });
        await test.step('Verify Bestellung über D2D filter is displayed', async () => {
            await expect(salesActionsPage.bestellungUeberD2DFilter).toBeVisible();
        });
        await test.step('Verify Ableger Zustimmung filter is displayed', async () => {
            await expect(salesActionsPage.ablegerZustimmungFilter).toBeVisible();
        });
        await test.step('Verify Kundendaten filter is displayed', async () => {
            await expect(salesActionsPage.kundendatenFilter).toBeVisible();
        });
        await test.step('Verify Sales Action-Type filter is displayed', async () => {
            await expect(salesActionsPage.salesActionTypeFilter).toBeVisible();
        });
        await test.step('Verify Objekt filter is displayed', async () => {
            await expect(salesActionsPage.objektFilter).toBeVisible();
        });
        await test.step('Verify zugewiesen an filter is displayed', async () => {
            await expect(salesActionsPage.zugewiesenAnFilter).toBeVisible();
        });
        await test.step('Verify upselling Potential filter is displayed', async () => {
            await expect(salesActionsPage.upsellingPotentialFilter).toBeVisible();
        });
    });
});
