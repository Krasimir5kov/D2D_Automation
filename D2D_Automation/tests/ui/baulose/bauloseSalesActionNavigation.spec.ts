/**
 * Covers: the "Zu Sales Actions" link in a Baulose row navigating to the
 * correct Sales Actions page.
 */
import { test, expect} from '../../../src/fixtures/baulose.fixture';
import { expectEveryRowColumnToContain } from '../../../src/helpers/filterAssertions';

test.describe('Baulose — Zu Sales Actions Navigation', () => {
  test.describe('Navigation button in Bestandsbau Section list items', { tag: ['@Admin', '@Admin-Regional'] }, () => {
    test(`Verify Bualose list items are not empty and have navigation buttons`, async ({baulosePage, salesActionsPage}) => {
        let firstRowDisplayName: string | null;

      await test.step('Verify that Baulose Section List View is opened', async ({}) => {
        await baulosePage.gotoBestandsbauListSection();
        await baulosePage.expectLoadedBestandsbau();
      });
      await test.step('Verify the Baulose list is not empty and Every row has the button', async () => {
        await expectEveryRowColumnToContain(baulosePage, { columnIndex: 4, expectedText: 'zu Sales Actions' });
      });
      await test.step('Click the Navigation Button in the first row and verify the Sales Actions page is opened', async () => {
        let firstRowDisplayName = await baulosePage.table.rows.first().locator('td').first().locator('div').first().textContent();
        await baulosePage.salesActionButtonFor(firstRowDisplayName!).click();
        await salesActionsPage.expectLoadedBestandsbau();
      });
      await test.step('Verify the Baulose is applied as a filter in the Sales Actions page', async () => {
        await expect(baulosePage.filters.filterBarChip(firstRowDisplayName!)).toBeVisible();
      });
    });
  })
  // TODO: navigation tests
});
