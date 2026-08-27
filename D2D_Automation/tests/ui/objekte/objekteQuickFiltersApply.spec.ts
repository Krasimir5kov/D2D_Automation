import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';

// TODO — UNCONFIRMED, verify all of the following via devtools before trusting this file:
// - Real stable id: D2D_Playwright_Attributes_Reference.md only documents the *pattern*
//   quick-filter-{filterId}-{choiceId} (confirmed example: objectType/NEUBAU) — the actual
//   filterId for Übergabestatus was never confirmed. Using text-based locators as a
//   fallback (the locator-priority table's documented last resort) until confirmed; swap
//   to `#quick-filter-{filterId}-{choiceId}` once known.
// - Whether clicking a quick filter needs a separate "Anwenden" step afterward, or filters
//   immediately — assumed immediate here, matching the attributes reference's own quick-
//   filter example (no separate apply call shown), but not independently confirmed for
//   this specific filter.
// - Which table column (if any) reflects Übergabestatus per row — the visible header shows
//   "Privat / D2D SA", not "Übergabestatus"; unclear if these are the same concept. No
//   row-level content check is included below for that reason — add one once confirmed,
//   rather than guessing a column here.
const uebergabestatusChoices = ['nicht übergeben', 'zurückgewiesen', 'übergeben'];

test.describe.skip('Objekte Quick Filters (Übergabestatus) Apply', () => {
    test.describe('Verify Übergabestatus quick filters on Neubau', () => {
        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.gotoNeubauSection();
            await objektePage.expectLoadedNeubau();
        });

        for (const choice of uebergabestatusChoices) {
            test(`Apply "${choice}" quick filter and verify it becomes pressed`, async ({ objektePage, page }) => {
                const quickFilterButton = page.getByRole('button', { name: choice, exact: true });

                await test.step(`Verify "${choice}" quick filter is visible`, async () => {
                    await expect(quickFilterButton).toBeVisible();
                });
                await test.step(`Click "${choice}" quick filter`, async () => {
                    await quickFilterButton.click();
                });
                await test.step('Verify the quick filter is now pressed', async () => {
                    await expect(quickFilterButton).toHaveAttribute('aria-pressed', 'true');
                });
                // TODO: no row-level content check yet — see the file-level comment above.
            });
        }
    });
});
