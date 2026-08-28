/**
 * Covers: the Objekte search field — entering text and the list updating
 * accordingly.
 */
import { expect } from '../../../src/fixtures/baulose.fixture';
import { test } from '../../../src/fixtures/object.fixture';
import { expectEveryRowDataObjectNameToContain, expectEveryRowNameCellToContain } from '../../../src/helpers/filterAssertions';

test.describe('Objekte Input Search Field', { tag: ['@Admin', '@Admin-Regional'] }, () => {
  test.describe('Object Search With Random Text Input that Always Returns Results', () => {
    const randomTextExpectResultsAlways = '100';
    test('NEUBAU: Verify that the results are correct and items title contains the search text', async ({ page, objektePage }) => {
      await test.step('Navigate to the Objekte Neubau section', async () => {
        await objektePage.goToObjektePage();
        await objektePage.gotoNeubauSection();
        await objektePage.expectLoadedNeubau();
      });
      await test.step('Enter the random text into the search field and trigger search', async () => {
        await objektePage.searchInputField.fill(randomTextExpectResultsAlways);
        await objektePage.searchInputField.press('Enter');
      });
      await test.step('Verify that the results are correct and items title contains the search text', async () => {
        await expect(objektePage.table.loadingCells).toHaveCount(0);
        await expectEveryRowNameCellToContain(objektePage, randomTextExpectResultsAlways);
      });
      // TODO: confirm real search field/clear-button ids for Objekte before filling this in.
    });
    test('FTTH: Verify that the results are correct and items title contains the search text', async ({ page, objektePage }) => {
      await test.step('Navigate to the Objekte FTTH section', async () => {
        await objektePage.goToObjektePage();
        await objektePage.gotoFtthSection();
        await objektePage.expectLoadedFtth();
      });
      await test.step('Enter the random text into the search field and trigger search', async () => {
        await objektePage.searchInputField.fill(randomTextExpectResultsAlways);
        await objektePage.searchInputField.press('Enter');
      });
      await test.step('Verify that the results are correct and items title contains the search text', async () => {
        await expect(objektePage.table.loadingCells).toHaveCount(0);
        await expectEveryRowNameCellToContain(objektePage, randomTextExpectResultsAlways);
      });
    });
    test('Bestandsbau: Verify that the results are correct and items title contains the search text', async ({ page, objektePage }) => {
      await test.step('Navigate to the Objekte Bestandsbau section', async () => {
        await objektePage.goToObjektePage();
        await objektePage.gotoBestandsbauSection();
        await objektePage.expectLoadedBestandsbau();
      });
      await test.step('Enter the random text into the search field and trigger search', async () => {
        await objektePage.searchInputField.fill(randomTextExpectResultsAlways);
        await objektePage.searchInputField.press('Enter');
      });
      await test.step('Verify that the results are correct and items title contains the search text', async () => {
        await expect(objektePage.table.loadingCells).toHaveCount(0);
        await expectEveryRowNameCellToContain(objektePage, randomTextExpectResultsAlways);
      });
    });
  });
});
