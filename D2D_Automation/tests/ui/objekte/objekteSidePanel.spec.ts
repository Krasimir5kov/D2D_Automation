/**
 * Covers: opening and closing the Objekte detail side panel from the Neubau
 * section list view.
 * Does NOT yet cover: FTTH/Bestandsbau panels, notes, questionnaire, or the
 * "Go to Sales Actions" cross-navigation — add once those areas are explored.
 */
import { test, expect } from '../../../src/fixtures/object.fixture';

test.describe('Objekte — Side Panel', { tag: ['@Admin', '@Admin-Regional'] }, () => {
  test('Opening the first Neubau row shows its side panel, and the close button closes it', async ({ objektePage }) => {
    await test.step('Open the Objekte Neubau list view', async () => {
      await objektePage.goto();
      await objektePage.expectLoaded();
    });
    await test.step('Click the first row to open its side panel', async () => {
      await expect(objektePage.table.loadingCells).toHaveCount(0);
      await objektePage.table.rows.first().click();
    });
    await test.step('Verify the Neubau side panel is open', async () => {
      await objektePage.expectNeubauObjectSidePanelOpen();
    });
    await test.step('Close the panel and verify it is no longer visible', async () => {
      await objektePage.neubauSidePanel.close();
      await expect(objektePage.neubauSidePanel.root).not.toBeVisible();
    });
  });
});
