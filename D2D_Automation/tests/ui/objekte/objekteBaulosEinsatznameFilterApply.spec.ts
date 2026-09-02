import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';
import { expectEveryRowBauloseEinsatznameToBe, expectListIsEmptyWithMessageByFilterDropDown } from '../../../src/helpers/filterAssertions';
import { getFirstRowBauloseEinsatzname } from '../../../src/helpers/filterHelpers';

test.describe('Objekte Baulos/Einsatzname Filter Apply', () => {
    test.describe("Verify Baulos/Einsatzname filter functionality and results in three sections", async () => {
        let searchTerm = '';
        let fullEinsatznameLine = '';
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.expectLoadedObjekte();
        });
        test('FTTH-AUSBAU: Filtering by the first row\'s Baulos/Einsatzname show only matching rows', async ({ objektePage, page }) => {
            await test.step('Go to FTTH-AUSBAU section', async () => {
                await objektePage.gotoFtthSection();
            });
            await test.step('Verify that FTTH-AUSBAU tab section is loaded', async () => {
                await objektePage.expectLoadedFtth();
            });
            await test.step('Get the first row\'s Baulos/Einsatzname value', async () => {
                ({ searchTerm, fullEinsatznameLine } = await getFirstRowBauloseEinsatzname(objektePage));
            });
            await test.step('Open the Baulos/Einsatzname filter and select the first row\'s Baulos/Einsatzname value', async () => {
                await objektePage.baulosEinsatznameFilter.click();
                await objektePage.filters.expectDropdownOpened();
                await expect(page.getByRole('textbox', { name: 'Baulos/Einsatzname suchen' })).toBeVisible();
                await objektePage.filters.dropDownSearchInputByLabel('Baulos/Einsatzname suchen').fill(searchTerm);
                await expect(page.locator('#filter-dropdown-root').getByText(searchTerm)).toBeVisible();
            });
            await test.step('Select the matching choice and apply the filter', async () => {
                await objektePage.filters.firstFoundAvailableChoiceCheckbox().click();
                await objektePage.filters.applyFilter();
            });
            await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                // The chip shows the full line exactly as displayed in the list (dash and
                // duplicate/uniqueId included), not the trimmed search term.
                await expect(objektePage.filters.filterBarChip(fullEinsatznameLine)).toBeVisible();
            });
            await test.step('Verify that the table shows only rows matching the selected Baulos/Einsatzname', async () => {
                await expectEveryRowBauloseEinsatznameToBe(objektePage, searchTerm);
            });
        });
        test('BESTANDSBAU: Filtering by the first row\'s Baulos/Einsatzname show only matching rows', async ({ objektePage, page }) => {
            await test.step('Go to BESTANDSBAU section', async () => {
                await objektePage.gotoBestandsbauSection();
            });
            await test.step('Verify that BESTANDSBAU tab section is loaded', async () => {
                await objektePage.expectLoadedBestandsbau();
            });
            await test.step('Get the first row\'s Baulos/Einsatzname value', async () => {
                ({ searchTerm, fullEinsatznameLine } = await getFirstRowBauloseEinsatzname(objektePage));
            });
            await test.step('Open the Baulos/Einsatzname filter and select the first row\'s Baulos/Einsatzname value', async () => {
                await objektePage.baulosEinsatznameFilter.click();
                await objektePage.filters.expectDropdownOpened();
                await expect(page.getByRole('textbox', { name: 'Baulos/Einsatzname suchen' })).toBeVisible();
                await objektePage.filters.dropDownSearchInputByLabel('Baulos/Einsatzname suchen').fill(searchTerm);
                await expect(page.locator('#filter-dropdown-root').getByText(searchTerm)).toBeVisible();
            });
            await test.step('Select the matching choice and apply the filter', async () => {
                await objektePage.filters.firstFoundAvailableChoiceCheckbox().click();
                await objektePage.filters.applyFilter();
            });
            await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                // The chip shows the full line exactly as displayed in the list (dash and
                // duplicate/uniqueId included), not the trimmed search term.
                await expect(objektePage.filters.filterBarChip(fullEinsatznameLine)).toBeVisible();
            });
            await test.step('Verify that the table shows only rows matching the selected Baulos/Einsatzname', async () => {
                await expectEveryRowBauloseEinsatznameToBe(objektePage, searchTerm);
            });
        });
        test('NEUBAU: Shows An Empty List When Use Baulos/Einsatzname Filter', async ({ objektePage, page }) => {
            await test.step('Go to NEUBAU section', async () => {
                await objektePage.gotoNeubauSection();
            });
            await test.step('Verify that NEUBAU tab section is loaded', async () => {
                await objektePage.expectLoadedNeubau();
            });
            await test.step('Open the Baulos/Einsatzname filter and apply random choice', async () => {
                await objektePage.baulosEinsatznameFilter.click();
                await objektePage.filters.expectDropdownOpened();
                await expect(page.getByRole('textbox', { name: 'Baulos/Einsatzname suchen' })).toBeVisible();
                await objektePage.filters.dropDownSearchInputByLabel('Baulos/Einsatzname suchen').fill('123');
                await objektePage.filters.firstFoundAvailableChoiceCheckbox().click();
                await objektePage.filters.applyFilter();
            });

            await test.step('Verify that the empty list message is displayed', async () => {
                await expect(objektePage.table.rows).toHaveCount(0);
                await expectListIsEmptyWithMessageByFilterDropDown(objektePage);
                await expect(objektePage.table.emptyStateDescriptionByFilterDropdown).toBeVisible();
            });
        });
    });
});
