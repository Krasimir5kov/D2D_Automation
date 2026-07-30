import { test, expect } from '../../../src/fixtures/baulose.fixture';

test.describe('Verification Baulose Page Filters Availability Across Sections', () => {
    test.describe('Bestandsbau Section', () => {
        test.beforeEach(async ({ page, baulosePage }) => {
            await baulosePage.gotoBestandsbauListSection();

            await baulosePage.expectLoadedBestandsbau();
            await expect(page).toHaveURL(/baulose/);
        });
        test('Verify Organization filter is available with Baulose Section Open', async ({ baulosePage }) => {
            await test.step('Organization filter is visible', async () => {
                await expect(baulosePage.filters.trigger('this.organisationFilter')).toBeVisible();
            });
        });
        test('Verify Regime filter is available with Baulose Section Open', async ({ baulosePage }) => {
            await test.step('Regime filter is visible', async () => {
                await expect(baulosePage.filters.trigger('this.regimeFilter')).toBeVisible();
            });
        });
        test('Verify Phase filter is available with Baulose Section Open', async ({ baulosePage }) => {
            await test.step('Phase filter is visible', async () => {
                await expect(baulosePage.filters.trigger('this.phaseFilter')).toBeVisible();
            });
        });
        test('Verify Status filter is available with Baulose Section Open', async ({ baulosePage }) => {
            await test.step('Status filter is visible', async () => {
                await expect(baulosePage.filters.trigger('this.statusFilter')).toBeVisible();
            });
        });
    });
    test.describe('FTTH Section', () => {
        test.beforeEach(async ({ page, baulosePage }) => {
            await baulosePage.gotoFTTHListSection();
            await baulosePage.expectLoadedFTTH();
            await expect(page).toHaveURL(/baulose/);
        });
        test('Verify Organization filter is available with FTTH Section Open', async ({ baulosePage }) => {
            await test.step('Organization filter is visible', async () => {
                await expect(baulosePage.filters.trigger('this.organisationFilter')).toBeVisible();
            });
        });
        test('Verify Regime filter is available with FTTH Section Open', async ({ baulosePage }) => {
            await test.step('Regime filter is visible', async () => {
                await expect(baulosePage.filters.trigger('this.regimeFilter')).toBeVisible();
            });
        });
        test('Verify Phase filter is available with FTTH Section Open', async ({ baulosePage }) => {
            await test.step('Phase filter is visible', async () => {
                await expect(baulosePage.filters.trigger('this.phaseFilter')).toBeVisible();
            });
        });
        test('Verify Status filter is available with FTTH Section Open', async ({ baulosePage }) => {
            await test.step('Status filter is visible', async () => {
                await expect(baulosePage.filters.trigger('this.statusFilter')).toBeVisible();
            });
        });
    })
})
