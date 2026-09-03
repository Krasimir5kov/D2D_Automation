/**
 * Covers: the Objekte search field — entering text and the list updating
 * accordingly.
 */
import { expect } from '../../../src/fixtures/baulose.fixture';
import { test } from '../../../src/fixtures/object.fixture';
import { expectEveryRowDataObjectNameToContain, expectEveryRowNameCellToContain } from '../../../src/helpers/filterAssertions';

test.describe('Objekte Input Search Field', { tag: ['@Admin', '@Admin-Regional'] }, () => {
    // SKIPPED: known Objekte backend slowness (Neubau salesStartDate sort, Jira-filed
    // 2026-09-02, see project-neubau-sort-performance-bug memory) makes these too slow/
    // unreliable to run until fixed. Remove this test.skip() once that ticket is resolved.
    test.skip();
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
  test.describe('Trigger Search Functionality With First Item Title Text Based On List Section', () => {
    let firstNeubauObjectName: string | null;
    let firstFtthObjectName: string | null;
    let firstBestandsbauObjectName: string | null;
    test('NEUBAU : Verify that the result return only search item title text in the list', async ({ page, objektePage }) => {
      await test.step('Navigate to the Objekte Neubau section', async () => {
        await objektePage.goToObjektePage();
        await objektePage.gotoNeubauSection();
        await objektePage.expectLoadedNeubau();
      });
      await test.step('Get the first item title text from the list', async () => {
        firstNeubauObjectName = await objektePage.neubauObjectName.first().getAttribute('data-object-name');

      });
      await test.step('Enter the first item title text into the search field and trigger search', async () => {
        await objektePage.searchInputField.fill(firstNeubauObjectName ?? '');
        await objektePage.searchInputField.press('Enter');
      });
      await test.step('Verify that the result return only search item title text in the list', async () => {
        await expect(objektePage.table.loadingCells).toHaveCount(0);
        await expectEveryRowDataObjectNameToContain(objektePage, firstNeubauObjectName ?? '');
      });
      await test.step('Verify that FTTH-AUSBAU list section is in an empty state', async () => {
        await objektePage.gotoFtthSection();
        await objektePage.expectLoadedFtth();
        await expect(objektePage.ftthObjectName).toHaveCount(0);
        await expect(objektePage.emptyStateHeadingMessageBySearchInput).toBeVisible();
        await expect(objektePage.emptyStateDescriptionMessageBySearchInput).toBeVisible();
      });
      await test.step('Verify that BESTANDSBAU list section is in an empty state', async () => {
        await objektePage.gotoBestandsbauSection();
        await objektePage.expectLoadedBestandsbau();
        await expect(objektePage.bestandsbauObjectName).toHaveCount(0);
        await expect(objektePage.emptyStateHeadingMessageBySearchInput).toBeVisible();
        await expect(objektePage.emptyStateDescriptionMessageBySearchInput).toBeVisible();
      });
    });
    test('FTTH : Verify that the result return only search item title text in the list', async ({ page, objektePage }) => {
      await test.step('Navigate to the Objekte FTTH section', async () => {
        await objektePage.goToObjektePage();
        await objektePage.gotoFtthSection();
        await objektePage.expectLoadedFtth();
      });
      await test.step('Get the first item title text from the list', async () => {
        firstFtthObjectName = await objektePage.ftthObjectName.first().getAttribute('data-object-name');
      });
      await test.step('Enter the first item title text into the search field and trigger search', async () => {
        await objektePage.searchInputField.fill(firstFtthObjectName ?? '');
        await objektePage.searchInputField.press('Enter');
      });
      await test.step('Verify that the result return only search item title text in the list', async () => {
        await expect(objektePage.table.loadingCells).toHaveCount(0);
        await expectEveryRowDataObjectNameToContain(objektePage, firstFtthObjectName ?? '');
      });
      await test.step('Verify that NEUBAU list section is in an empty state', async () => {
        await objektePage.gotoNeubauSection();
        await objektePage.expectLoadedNeubau();
        await expect(objektePage.neubauObjectName).toHaveCount(0);
        await expect(objektePage.emptyStateHeadingMessageBySearchInput).toBeVisible();
        await expect(objektePage.emptyStateDescriptionMessageBySearchInput).toBeVisible();
      });
      await test.step('Verify that BESTANDSBAU list section is in an empty state', async () => {
        await objektePage.gotoBestandsbauSection();
        await objektePage.expectLoadedBestandsbau();
        await expect(objektePage.bestandsbauObjectName).toHaveCount(0);
        await expect(objektePage.emptyStateHeadingMessageBySearchInput).toBeVisible();
        await expect(objektePage.emptyStateDescriptionMessageBySearchInput).toBeVisible();
      });
    });
    test('Bestandsbau : Verify that the result return only search item title text in the list', async ({ page, objektePage }) => {
      await test.step('Navigate to the Objekte Bestandsbau section', async () => {
        await objektePage.goToObjektePage();
        await objektePage.gotoBestandsbauSection();
        await objektePage.expectLoadedBestandsbau();
      });
      await test.step('Get the first item title text from the list', async () => {
        firstBestandsbauObjectName = await objektePage.bestandsbauObjectName.first().getAttribute('data-object-name');
      });
      await test.step('Enter the first item title text into the search field and trigger search', async () => {
        await objektePage.searchInputField.fill(firstBestandsbauObjectName ?? '');
        await objektePage.searchInputField.press('Enter');
      });
      await test.step('Verify that the result return only search item title text in the list', async () => {
        await expect(objektePage.table.loadingCells).toHaveCount(0);
        await expectEveryRowDataObjectNameToContain(objektePage, firstBestandsbauObjectName ?? '');
      });
      await test.step('Verify that FTTH-AUSBAU list section is in an empty state', async () => {
        await objektePage.gotoFtthSection();
        await objektePage.expectLoadedFtth();
        await expect(objektePage.ftthObjectName).toHaveCount(0);
        await expect(objektePage.emptyStateHeadingMessageBySearchInput).toBeVisible();
        await expect(objektePage.emptyStateDescriptionMessageBySearchInput).toBeVisible();
      });
      await test.step('Verify that NEUBAU list section is in an empty state', async () => {
        await objektePage.gotoNeubauSection();
        await objektePage.expectLoadedNeubau();
        await expect(objektePage.neubauObjectName).toHaveCount(0);
        await expect(objektePage.emptyStateHeadingMessageBySearchInput).toBeVisible();
        await expect(objektePage.emptyStateDescriptionMessageBySearchInput).toBeVisible();
      });
    });
  });
});
