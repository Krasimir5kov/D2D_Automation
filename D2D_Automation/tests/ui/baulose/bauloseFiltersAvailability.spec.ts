/**
 * Covers: Importdatum ,Organisation, Regime, Phase, Status, — trigger visibility only, both
 * Bestandsbau and FTTH sections.
 * Does NOT cover: selecting a value, applying it, or asserting list results —
 * see bauloseFiltersApply.spec.ts for that.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';

test.describe('Verification Baulose Page Filters Availability Across Sections', () => {
    test.describe('Bestandsbau Section',
        { tag: ['@Admin', '@Admin-Regional'] },
         () => {
             test.beforeEach(async ({ page, baulosePage }) => {
                await baulosePage.gotoBestandsbauListSection();

                await baulosePage.expectLoadedBestandsbau();
                await expect(page).toHaveURL(/baulose/);
            });
             test("Verify Importdatum filter is available with Bestandsbau Section Open", async ({ baulosePage }) => {
                await test.step('Importdatum filter is visible', async () => {
                    await expect(baulosePage.filters.importDateFilter).toBeVisible();
                });
            });
             test('Verify Organization filter is available with Baulose Section Open', async ({ baulosePage }) => {
                await test.step('Organization filter is visible', async () => {
                    await expect(baulosePage.filters.organisationFilter).toBeVisible();
                });
            });
             test('Verify Regime filter is available with Baulose Section Open', async ({ baulosePage }) => {
                await test.step('Regime filter is visible', async () => {
                    await expect(baulosePage.filters.regimeFilter).toBeVisible();
                });
            });
             test('Verify Phase filter is available with Baulose Section Open', async ({ baulosePage }) => {
                await test.step('Phase filter is visible', async () => {
                    await expect(baulosePage.filters.phaseFilter).toBeVisible();
                });
            });
            test('Verify Status filter is available with Baulose Section Open', async ({ baulosePage }) => {
                await test.step('Status filter is visible', async () => {
                    await expect(baulosePage.filters.statusFilter).toBeVisible();
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
                await test.step('Importdatum filter is visible', async () => {
                    await expect(baulosePage.filters.importDateFilter).toBeVisible();
                });
            });
             test('Verify Organization filter is available with FTTH Section Open', async ({ baulosePage }) => {
                await test.step('Organization filter is visible', async () => {
                    await expect(baulosePage.filters.organisationFilter).toBeVisible();
                });
            });
             test('Verify Regime filter is available with FTTH Section Open', async ({ baulosePage }) => {
                await test.step('Regime filter is visible', async () => {
                    await expect(baulosePage.filters.regimeFilter).toBeVisible();
                });
            });
             test('Verify Phase filter is available with FTTH Section Open', async ({ baulosePage }) => {
                await test.step('Phase filter is visible', async () => {
                    await expect(baulosePage.filters.phaseFilter).toBeVisible();
                });
            });
             test('Verify Status filter is available with FTTH Section Open', async ({ baulosePage }) => {
                await test.step('Status filter is visible', async () => {
                    await expect(baulosePage.filters.statusFilter).toBeVisible();
                });
            });
        })
})
