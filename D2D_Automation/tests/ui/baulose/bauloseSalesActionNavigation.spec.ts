/**
 * Covers: the "Zu Sales Actions" link button in a Baulose row navigating to the
 * correct Sales Actions page redirection and filter application.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';
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
      await test.step('Verify the Baulose list is not empty and Every row item has the button', async () => {
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
  test.describe('Navigation button in FTTH-AUSBAU Section list items', { tag: ['@Admin', '@Admin-Regional'] }, () => { 
    test(`Verify FTTH-AUSBAU section list items Navigation button functionality`, async ({ baulosePage, salesActionsPage }) => {
      let firstRowDisplayNameInFtthAusbau: string | null;
      let secondRowDisplayNameInFtthAusbau: string | null;
      await test.step('Verify that Baulose FTTH-AUSBAU Section List View is opened', async ({ }) => {
        await baulosePage.gotoFTTHListSection();
        await baulosePage.expectLoadedFTTH();
      });
      await test.step('Verify FTTH-AUSBAU list is not empty and Every row item has the button', async () => {
        await expectEveryRowColumnToContain(baulosePage, { columnIndex: 5, expectedText: 'zu Sales Actions' });
      });
      await test.step('Click the Navigation Button in the first row and verify the Sales Actions page is opened', async () => {
        firstRowDisplayNameInFtthAusbau = await baulosePage.table.rows.first().locator('td').first().locator('div > div').first().textContent();
        secondRowDisplayNameInFtthAusbau = await baulosePage.table.rows.first().locator('td').first().locator('div > div:nth-child(2)').textContent();
        await baulosePage.salesActionButtonFor(firstRowDisplayNameInFtthAusbau!).click();
      });
      await test.step('Verify the Sales Actions page is opened with the correct filter applied and section', async () => {
        await salesActionsPage.expectLoadedFTTH();
      });
      await test.step('Verify the Baulose is applied as a filter in the Sales Actions page and chip is displayed', async () => {
        const exppectedChipFtthAusbauText = `${firstRowDisplayNameInFtthAusbau} - ${secondRowDisplayNameInFtthAusbau}`;
        await expect(baulosePage.filters.filterBarChip(exppectedChipFtthAusbauText)).toBeVisible();
        await expect(salesActionsPage.ftthAusbauListView).toBeVisible();
      });
      await test.step('Verify that the Bestandsbau Section list view is empty', async () => {
        await salesActionsPage.gotoDoor2DoorRoute('/sales-actions/bestandsbau');
        await salesActionsPage.expectLoadedBestandsbau();
        await expect(salesActionsPage.bestandsbauTabListView).toBeVisible();
        await expect(salesActionsPage.bestandsbauTabListView.locator('tr')).toHaveCount(1);
      });
      await test.step('Verify that the Neubau Section list view is empty', async () => {
        await salesActionsPage.gotoDoor2DoorRoute('/sales-actions/neubau');
        await salesActionsPage.expectLoadedNeubau();
        await expect(salesActionsPage.neubauListView).toBeVisible();
        await expect(salesActionsPage.neubauListView.locator('tr')).toHaveCount(1);
      });
    });
  });
});
