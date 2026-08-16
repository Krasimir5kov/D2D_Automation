/**
 * Covers: the "Zu Sales Actions" link in a Baulose row navigating to the
 * correct Sales Actions page.
 */
import { test, expect} from '../../../src/fixtures/baulose.fixture';
import { expectEveryRowColumnToContain } from '../../../src/helpers/filterAssertions';

const escapeForRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Baulose — Zu Sales Actions Navigation', () => {
  test.describe('Navigation button in Bestandsbau Section list items', { tag: ['@Admin', '@Admin-Regional'] }, () => {
    test(`Verify Bualose list items are not empty and have navigation buttons`, async ({page, baulosePage, salesActionsPage}) => {
        let firstRowDisplayName: string;

      await test.step('Verify that Baulose Section List View is opened', async ({}) => {
        await baulosePage.gotoBestandsbauListSection();
        await baulosePage.expectLoadedBestandsbau();
      });
      await test.step('Verify the Baulose list is not empty and Every row has the button', async () => {
        await expectEveryRowColumnToContain(baulosePage, { columnIndex: 4, expectedText: 'zu Sales Actions' });
      });
      await test.step('Click the Navigation Button in the first row and verify the Sales Actions page is opened', async () => {
        const firstRow = baulosePage.table.rows.first();
        const firstNameCellText = await firstRow.locator('td').first().innerText();
        const [displayName] = firstNameCellText
          .split('\n')
          .map((text) => text.trim())
          .filter(Boolean);

        if (!displayName) {
          throw new Error('First Baulose row display name was empty');
        }

        firstRowDisplayName = displayName;

        await firstRow.getByRole('button', { name: /zu Sales Actions/i }).click();
        await salesActionsPage.expectLoadedBestandsbau();
      });
      await test.step('Verify the Baulose is applied as a filter in the Sales Actions page', async () => {
        await expect(page.getByRole('button', { name: /^Baulos\/Einsatzname \(1\)$/ })).toBeVisible();
        await expect(page.getByRole('button', { name: new RegExp(escapeForRegExp(firstRowDisplayName), 'i') })).toBeVisible();
      });
    });
  })
  // TODO: navigation tests
});
