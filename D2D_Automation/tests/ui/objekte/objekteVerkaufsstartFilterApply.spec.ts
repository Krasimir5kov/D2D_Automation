import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';
import { expectEveryRowColumnToContain } from '../../../src/helpers/filterAssertions';
import { verkaufsstartOptions } from '../../../src/constants/objectFilterValues';

// TODO — UNCONFIRMED, verify all of the following via devtools before trusting this file:
// - Control type: assumed radio-based (choiceRadio()/choiceLabelButton()), by analogy with
//   PLZ/Fragebogen reusing the same styled-radio component — never independently checked
//   for this specific filter. Could turn out to be a checkbox list, a date picker, or
//   something else entirely, in which case this whole "Open filter" step needs rewriting.
// - Choice labels: "8 Tage"/"6 Wochen" (objectFilterValues.ts) are a guess carried over from
//   an earlier investigation note, not confirmed live. Real labels may differ or there may
//   be more/fewer choices.
// - Column index: assumed to be the "Verkaufsstart" column visible in the table header
//   (index 3, "Objekt | Subtyp | Organisation | Verkaufsstart | Privat / D2D SA |
//   Fragebogen") — not independently re-checked here.
const VERKAUFSSTART_COLUMN_INDEX = 3;

test.describe.skip('Objekte Verkaufsstart Filter Apply', () => {
    test.describe('Verify Verkaufsstart filter functionality and results on Neubau', () => {
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.gotoNeubauSection();
            await objektePage.expectLoadedNeubau();
        });

        for (const option of verkaufsstartOptions) {
            test(`Apply Verkaufsstart filter option (${option}) and verify results`, async ({ objektePage }) => {
                await test.step('Verify filter Verkaufsstart is visible', async () => {
                    await expect(objektePage.verkaufsstartFilter).toBeVisible();
                });
                await test.step(`Open Verkaufsstart filter and select "${option}"`, async () => {
                    await objektePage.verkaufsstartFilter.click();
                    // UNCONFIRMED: assumes radio-based, same as PLZ/Fragebogen. Verify live
                    // before trusting this — see the file-level TODO above.
                    await objektePage.filters.choiceLabelButton(option).click();
                    await expect(objektePage.filters.choiceRadio(option)).toBeChecked();
                });
                await test.step('Apply the filter', async () => {
                    await objektePage.filters.applyFilter();
                });
                await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                    // UNCONFIRMED chip text format — same caveat as every other filter here.
                    await expect(objektePage.filters.filterBarChip(option)).toBeVisible();
                });
                await test.step('Verify that every row\'s Verkaufsstart column matches the selected option', async () => {
                    await expectEveryRowColumnToContain(objektePage, {
                        columnIndex: VERKAUFSSTART_COLUMN_INDEX,
                        expectedText: option,
                    });
                });
            });
        }
    });
});
