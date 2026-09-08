import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';
import { expectEveryRowSalesStartWithinRelativeRange } from '../../../src/helpers/filterAssertions';
import { verkaufsstartStatusSectionOptions, verkaufsstartTerminOptions } from '../../../src/constants/objectFilterValues';
import { expectListIsEmptyWithMessageByFilterDropDown } from '../../../src/helpers/filterAssertions';
import { expectEveryRowColumnToContain  } from '../../../src/helpers/filterAssertions';
const VERKAUFSSTART_COLUMN_INDEX = 3;

test.describe('Objekte Verkaufsstart Filter Apply', () => {
    test.describe('Verify Verkaufsstart-Termin Filter Options Update List Items Accordingly', () => {
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.gotoNeubauSection();
            await objektePage.expectLoadedNeubau();
        });

        for (const option of Object.values(verkaufsstartTerminOptions)) {
            test(`Apply Verkaufsstart filter option (${option.label}) and verify results's Verkaufsstart dates`, async ({ objektePage }) => {
                await test.step('Verify filter Verkaufsstart is visible', async () => {
                    await expect(objektePage.verkaufsstartFilter).toBeVisible();
                });
                await test.step(`Open Verkaufsstart filter and select "${option.label}"`, async () => {
                    await objektePage.verkaufsstartFilter.click();
                    await objektePage.filters.choiceLabelButton(option.label).click();
                    await expect(objektePage.filters.choiceRadio(option.label)).toBeChecked();
                });
                await test.step('Apply the filter', async () => {
                    await objektePage.filters.applyFilter();
                });
                await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                    await expect(objektePage.filters.filterBarChip(option.label)).toBeVisible();
                });
                await test.step('Verify that every row\'s Verkaufsstart date falls within the selected range', async () => {
                    await expectEveryRowSalesStartWithinRelativeRange(objektePage, {
                        columnIndex: VERKAUFSSTART_COLUMN_INDEX,
                        maxDaysFromToday: option.maxDaysFromToday,
                    });
                });
            });

        } for (const otherOption of Object.values(verkaufsstartTerminOptions)) {
            test(`Apply filters options (${otherOption.label}) then verify that FTTH-AUBAU and BESTANDSBAU are in empty state`, async ({ objektePage }) => {
                await test.step(`Open Verkaufsstart filter "${otherOption.label}"`, async () => {
                    await objektePage.verkaufsstartFilter.click();
                });
                await test.step(`Select Verkaufsstart filter option "${otherOption.label}"`, async () => {
                    await objektePage.filters.choiceLabelButton(otherOption.label).click();
                    await expect(objektePage.filters.choiceRadio(otherOption.label)).toBeChecked();
                });
                await test.step('Apply the filter', async () => {
                    await objektePage.filters.applyFilter();
                });
                await test.step('Navigate to FTTH-AUSBAU list section and verify that the list is in empty state', async () => {
                    await objektePage.gotoFtthSection();
                    await expectListIsEmptyWithMessageByFilterDropDown(objektePage);
                    await expect(objektePage.table.rows).toHaveCount(0);
                });
                await test.step('Navigate to BESTANDSBAU list section and verify that the list is in empty state', async () => {
                    await objektePage.gotoBestandsbauSection();
                    await expectListIsEmptyWithMessageByFilterDropDown(objektePage);
                    await expect(objektePage.table.rows).toHaveCount(0);
                });
            });
        }
    });
    test.describe('Verify Verkaufsstart-Status Filter Options Update List Items Accordingly', () => {
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.expectLoadedObjekte();
        });
        for (const statusOption of Object.values(verkaufsstartStatusSectionOptions)) {
            test(`Apply Verkaufsstart-Status filter option (${statusOption}) and verify results's Verkaufsstart status in NEUBAU section`, async ({ objektePage }) => {
                await test.step('Verify filter Verkaufsstart-Status is visible', async () => {
                    await expect(objektePage.verkaufsstartFilter).toBeVisible();
                });
                await test.step(`Open Verkaufsstart filter`, async () => {
                    await objektePage.verkaufsstartFilter.click();
                });
                await test.step(`Select Verkaufsstart-Status filter option "${statusOption}"`, async () => {
                    await objektePage.filters.choiceLabelButton(statusOption).click();
                });
                await test.step('Verify that the selected option is checked', async () => {
                    await expect(objektePage.filters.choiceCheckbox(statusOption)).toBeChecked();
                });
                await test.step('Apply the filter', async () => {
                    await objektePage.filters.applyFilter();
                });
                await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                    await expect(objektePage.filters.filterBarChip(statusOption)).toBeVisible();
                });
                await test.step('Navigate to NEUBAU list section and verify that every row\'s Verkaufsstart status matches the selected option', async () => {
                    await objektePage.gotoNeubauSection();
                    await expectEveryRowColumnToContain(objektePage, {
                        columnIndex: VERKAUFSSTART_COLUMN_INDEX,
                        expectedText: statusOption,
                        ignoreCase: true,
                    });
                });
            });
        } for (const otherStatusOption of Object.values(verkaufsstartStatusSectionOptions)) {
            test(`Apply filters options (${otherStatusOption}) then verify that FTTH-AUBAU and BESTANDSBAU are in empty state`, async ({ objektePage }) => {
                await test.step(`Open Verkaufsstart filter`, async () => {
                    await objektePage.verkaufsstartFilter.click();
                });
                await test.step(`Select Verkaufsstart-Status filter option "${otherStatusOption}"`, async () => {
                    await objektePage.filters.choiceLabelButton(otherStatusOption).click();
                });
                await test.step('Verify that the selected option is checked', async () => {
                    await expect(objektePage.filters.choiceCheckbox(otherStatusOption)).toBeChecked();
                });
                await test.step('Apply the filter', async () => {
                    await objektePage.filters.applyFilter();
                });
                await test.step('Navigate to FTTH-AUSBAU list section and verify that the list is in empty state', async () => {
                    await objektePage.gotoFtthSection();
                    await expectListIsEmptyWithMessageByFilterDropDown(objektePage);
                    await expect(objektePage.table.rows).toHaveCount(0);
                });
                await test.step('Navigate to BESTANDSBAU list section and verify that the list is in empty state', async () => {
                    await objektePage.gotoBestandsbauSection();
                    await expectListIsEmptyWithMessageByFilterDropDown(objektePage);
                    await expect(objektePage.table.rows).toHaveCount(0);
                });
            });
        }
    });
});
