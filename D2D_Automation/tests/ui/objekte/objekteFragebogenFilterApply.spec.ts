import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';
import { expectEveryRowColumnToContain, expectListIsEmptyWithMessageByFilterDropDown } from '../../../src/helpers/filterAssertions';
import { fragebogenOptions } from '../../../src/constants/objectFilterValues';
import { TABLE_STATUS_CHIP_COLORS } from '../../../src/constants/objectStatusChipColors';


// UNCONFIRMED: column index 5 assumes the header order "Objekt | Subtyp | Organisation |
// Verkaufsstart | Privat / D2D SA | Fragebogen" holds identically across all 3 tabs — only
// independently seen for Neubau/Bestandsbau so far, not FTTH-Ausbau. Re-check before
// running this against a tab other than Neubau.
const FRAGEBOGEN_COLUMN_INDEX = 5;

test.describe('Objekte Fragebogen Filter Apply', () => {
    test.describe('Verify Fragebogen filter functionality and results on Neubau', () => {
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.gotoNeubauSection();
            await objektePage.expectLoadedNeubau();
        });

        for (const option of fragebogenOptions) {
            test(`Apply Fragebogen filter option (${option}) and verify results`, async ({ objektePage }) => {
                await test.step('Verify filter Fragebogen is visible', async () => {
                    await expect(objektePage.fragenBogenFilterStatus).toBeVisible();
                });
                await test.step(`Open Fragebogen filter and select "${option}"`, async () => {
                    await objektePage.fragenBogenFilterStatus.click();

                    await objektePage.filters.choiceLabelButton(option).click();
                    await expect(objektePage.filters.choiceRadio(option)).toBeChecked();
                });
                await test.step('Apply the filter', async () => {
                    await objektePage.filters.applyFilter();
                });
                await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                    await expect(objektePage.filters.filterBarChip(`Fragebogen: ${option}`)).toBeVisible();
                });
                await test.step('Verify that every row\'s Fragebogen column matches the selected option', async () => {
                    await expectEveryRowColumnToContain(objektePage, {
                        columnIndex: FRAGEBOGEN_COLUMN_INDEX,
                        expectedText: option,
                        expectedBackgroundColor: TABLE_STATUS_CHIP_COLORS[option],
                    });
                });
                await test.step('Navigate and verify that FTTH-AUSBAU list is empty ', async () => {
                    await objektePage.gotoFtthSection();
                    await expectListIsEmptyWithMessageByFilterDropDown(objektePage);
                    await expect(objektePage.table.rows).toHaveCount(0);
                });
                await test.step('Navigate and verify that BESTANDSBAU list is empty ', async () => {
                    await objektePage.gotoBestandsbauSection();
                    await expectListIsEmptyWithMessageByFilterDropDown(objektePage);
                    await expect(objektePage.table.rows).toHaveCount(0);
                });
            });
        }
    });
});
