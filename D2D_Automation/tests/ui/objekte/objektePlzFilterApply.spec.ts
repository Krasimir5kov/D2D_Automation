import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';
import { expectEveryRowPlzWithinRange, expectPlzRangeChipVisible, expectTableSettled } from '../../../src/helpers/filterAssertions';
import { plzOptions } from '../../../src/constants/objectFilterValues';
test.describe('Objekte PLZ Filter Apply', () => {
    test.describe("Verify PLZ filter functionality and results in three sections", async () => {
        const plzValues = [{ 'from': '1010', 'to': '1020' }];
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.expectLoadedObjekte();
        });
        test('Apply PLZ filter and check results in three section', async ({ objektePage, page }) => {
            await test.step('Go to Bestandsbau section', async () => {
                await objektePage.gotoBestandsbauSection();
            });
            await test.step('Verify that Bestandsbau tab section is loaded', async () => {
                await objektePage.expectLoadedBestandsbau();
            });
            await test.step('Verify filter PLZ is visible', async () => {
                await expect(objektePage.plzFilter).toBeVisible();
            });
            await test.step('Open PLZ filter and fill in PLZ bis and ab', async () => {
                await objektePage.plzFilter.click();
                await objektePage.filters.expectDropdownOpened();
                await objektePage.filters.choiceLabelButton(plzOptions[0]).click();
                await expect(objektePage.filters.choiceRadio(plzOptions[0])).toBeChecked();
                await objektePage.plzFromInput.fill(plzValues[0].from);
                await objektePage.plzOutInput.fill(plzValues[0].to);
            });
            await test.step('Apply filter', async () => {
                await objektePage.filters.applyFilter();
            });
            const plzRange = { from: Number(plzValues[0].from), to: Number(plzValues[0].to) };

            await test.step('Verify that chip creteria is visible in Filter Bar Chip', async () => {
                await expectPlzRangeChipVisible(objektePage, plzRange);
            });
            await test.step('Verify that the table is filtered by PLZ', async () => {
                await expectEveryRowPlzWithinRange(objektePage, { from: Number(plzValues[0].from), to: Number(plzValues[0].to) });
            });

            const otherObjectSections = [
                { name: 'FTTH-Ausbau', tab: objektePage.ftthTab },
                { name: 'Neubau', tab: objektePage.neubauTab },
            ];

            for (const section of otherObjectSections) {
                await test.step(`Verify PLZ filter still applies in ${section.name} and list results are correct`, async () => {
                    await section.tab.click();
                    await expectPlzRangeChipVisible(objektePage, plzRange);
                    await expectEveryRowPlzWithinRange(objektePage, plzRange);
                });
            }
        });

    });
});
