/**
 * Covers: the Sales Actions Baulos/Einsatzname filter — applying it and verifying results.
 * Trigger: salesActionsPage.baulosEinsatznameFilter (#contractSection) — same id as
 * Page objects define each page's row content; the shared helper reads its value.
 *
 * Remaining coverage: Neubau and Bestandsbau.
 */
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { expectEveryRowBauloseEinsatznameToBe } from '../../../../src/helpers/filterAssertions';
import { getFirstRowBauloseEinsatzname } from '../../../../src/helpers/filterHelpers';
import { expect } from '@playwright/test';
test.describe('Sales Actions Baulos/Einsatzname Filter Apply', () => {
    test.describe('Verify Baulos/Einsatzname filter functionality and results in three sections', () => {
        test.beforeEach(async ({ salesActionsPage }) => {
            await salesActionsPage.goToSalesActionPage();
            await salesActionsPage.expectLoadedSalesAction();
        });
        test('FTTH-AUSBAU: Filtering by the first row\'s Baulos/Einsatzname shows only matching rows', async ({ salesActionsPage }) => {
            await test.step('Go to FTTH-AUSBAU section', async () => {
                await salesActionsPage.gotoFtthSalesAction();
            });
            await test.step('Verify that FTTH-AUSBAU section is loaded', async () => {
                await salesActionsPage.expectLoadedFTTH();
            });
            const { searchTerm, fullEinsatznameLine } = await test.step(
                'Read the first row\'s Baulos/Einsatzname',
                async () => getFirstRowBauloseEinsatzname(salesActionsPage),
            );
            await test.step('Open the Baulos/Einsatzname filter dropdown', async () => {
                await salesActionsPage.baulosEinsatznameFilter.click();
                await salesActionsPage.filters.expectDropdownOpened();
                await expect(salesActionsPage.baulosEinsatznameSearchInput).toBeVisible();
            });
            await test.step('Apply the Baulos/Einsatzname filter with the search term', async () => {
                await salesActionsPage.baulosEinsatznameSearchInput.fill(searchTerm);
                await expect(salesActionsPage.filters.choiceLabelButton(fullEinsatznameLine)).toBeVisible();
            });
            await test.step('Select first found option based on the search term', async () => {
                await salesActionsPage.filters.choiceLabelButton(fullEinsatznameLine).click();
            });
            await test.step('Apply the Baulos/Einsatzname filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that only the filtered result row is displayed', async () => {
                await expectEveryRowBauloseEinsatznameToBe(salesActionsPage, searchTerm);
            });
        });
        test('BESTANDSBAU: Filtering by the first row\'s Baulos/Einsatzname shows only matching rows', async ({ salesActionsPage }) => {    
            await test.step('Go to BESTANDSBAU section', async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
            });
            await test.step('Verify that BESTANDSBAU section is loaded', async () => {
                await salesActionsPage.expectLoadedBestandsbau();
            });
            const { searchTerm, fullEinsatznameLine } = await test.step(
                'Read the first row\'s Baulos/Einsatzname',
                async () => getFirstRowBauloseEinsatzname(salesActionsPage),
            );
            await test.step('Open the Baulos/Einsatzname filter dropdown', async () => {
                await salesActionsPage.baulosEinsatznameFilter.click();
                await salesActionsPage.filters.expectDropdownOpened();
                await expect(salesActionsPage.baulosEinsatznameSearchInput).toBeVisible();
            });
            await test.step('Apply the Baulos/Einsatzname filter with the search term', async () => {
                await salesActionsPage.baulosEinsatznameSearchInput.fill(searchTerm);
                await expect(salesActionsPage.filters.choiceLabelButton(fullEinsatznameLine)).toBeVisible();
            });
            await test.step('Select first found option based on the search term', async () => {
                await salesActionsPage.filters.choiceLabelButton(fullEinsatznameLine).click();
            });
            await test.step('Apply the Baulos/Einsatzname filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that only the filtered result row is displayed', async () => {
                await expectEveryRowBauloseEinsatznameToBe(salesActionsPage, searchTerm);
            });
        });
        test('NEUBAU: Shows An Empty List When Use Baulos/Einsatzname Filter', async ({ salesActionsPage }) => {    
            await test.step('Go to NEUBAU section', async () => {
                await salesActionsPage.gotoNeubauSalesAction();
            });
            await test.step('Verify that NEUBAU section is loaded', async () => {
                await salesActionsPage.expectLoadedNeubau();
            });
            await test.step('Open the Baulos/Einsatzname filter dropdown', async () => {
                await salesActionsPage.baulosEinsatznameFilter.click();
                await salesActionsPage.filters.expectDropdownOpened();
                await expect(salesActionsPage.baulosEinsatznameSearchInput).toBeVisible();
                await salesActionsPage.filters.dropDownSearchInputByLabel('Baulos/Einsatzname suchen').fill('123');
                await salesActionsPage.filters.firstFoundAvailableChoiceCheckbox().click();
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that the list is empty', async () => {
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
        });
});
