/**
 * Covers: Importdatum ,Organisation, Regime, Phase, Status, — trigger visibility and
 * correct title, both Bestandsbau and FTTH sections.
 * Does NOT cover: selecting a value, applying it, or asserting list results —
 * see bauloseFiltersApply.spec.ts for that.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';
import { BAULOSE_FILTERS } from '../../../src/constants/bauloseFiltersTitle';

test.describe('Verification Baulose Page Filters Availability', () => {
    test.describe('Bestandsbau Section',
        { tag: ['@Admin', '@Admin-Regional'] },
         () => {
             test.beforeEach(async ({ page, baulosePage }) => {
                await baulosePage.gotoBestandsbauListSection();

                await baulosePage.expectLoadedBestandsbau();
                await expect(page).toHaveURL(/baulose/);
            });
             test("Verify Importdatum filter is available with Bestandsbau Section Open", async ({ baulosePage }) => {
                await test.step('Importdatum filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.importDateFilter).toBeVisible();
                    await expect(baulosePage.filters.importDateFilter).toHaveText(BAULOSE_FILTERS.importData.label);
                });
            });
             test('Verify Organization filter is available with Baulose Section Open', async ({ baulosePage }) => {
                await test.step('Organization filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.organisationFilter).toBeVisible();
                    await expect(baulosePage.filters.organisationFilter).toHaveText(BAULOSE_FILTERS.organizations.label);
                });
            });
             test('Verify Regime filter is available with Baulose Section Open', async ({ baulosePage }) => {
                await test.step('Regime filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.regimeFilter).toBeVisible();
                    await expect(baulosePage.filters.regimeFilter).toHaveText(BAULOSE_FILTERS.baulosSubTypes.label);
                });
            });
             test('Verify Phase filter is available with Baulose Section Open', async ({ baulosePage }) => {
                await test.step('Phase filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.phaseFilter).toBeVisible();
                    await expect(baulosePage.filters.phaseFilter).toHaveText(BAULOSE_FILTERS.contractSectionPhaseAdmins.label);
                });
            });
            test('Verify Status filter is available with Baulose Section Open', async ({ baulosePage }) => {
                await test.step('Status filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.statusFilter).toBeVisible();
                    await expect(baulosePage.filters.statusFilter).toHaveText(BAULOSE_FILTERS.baulosStatus.label);
                });
            });
        });
    test.describe('FTTH Section',
        { tag: ['@Admin', '@Admin-Regional'] },
         () => {
          test.beforeEach(async ({ page, baulosePage }) => {
                await baulosePage.gotoFTTHListSection();
                await baulosePage.expectLoadedFTTH();
                await expect(page).toHaveURL(/baulose/);
            });
             test("Verify Importdatum filter is available with FTTH Section Open", async ({ baulosePage }) => {
                await test.step('Importdatum filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.importDateFilter).toBeVisible();
                    await expect(baulosePage.filters.importDateFilter).toHaveText(BAULOSE_FILTERS.importData.label);
                });
            });
             test('Verify Organization filter is available with FTTH Section Open', async ({ baulosePage }) => {
                await test.step('Organization filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.organisationFilter).toBeVisible();
                    await expect(baulosePage.filters.organisationFilter).toHaveText(BAULOSE_FILTERS.organizations.label);
                });
            });
             test('Verify Regime filter is available with FTTH Section Open', async ({ baulosePage }) => {
                await test.step('Regime filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.regimeFilter).toBeVisible();
                    await expect(baulosePage.filters.regimeFilter).toHaveText(BAULOSE_FILTERS.baulosSubTypes.label);
                });
            });
             test('Verify Phase filter is available with FTTH Section Open', async ({ baulosePage }) => {
                await test.step('Phase filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.phaseFilter).toBeVisible();
                    await expect(baulosePage.filters.phaseFilter).toHaveText(BAULOSE_FILTERS.contractSectionPhaseAdmins.label);
                });
            });
             test('Verify Status filter is available with FTTH Section Open', async ({ baulosePage }) => {
                await test.step('Status filter is visible with the correct title', async () => {
                    await expect(baulosePage.filters.statusFilter).toBeVisible();
                    await expect(baulosePage.filters.statusFilter).toHaveText(BAULOSE_FILTERS.baulosStatus.label);
                });
            });
        })
})
