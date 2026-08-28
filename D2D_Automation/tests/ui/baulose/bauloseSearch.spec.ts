/**
 * Covers: the Baulose search field — entering text and the list updating
 * accordingly.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';
import { searchByPressingEnterAndWaitForResults, searchByClickingButtonAndWaitForResults } from '../../../src/helpers/filterHelpers';

test.describe('Baulose Input Search Field', () => {
  const CONTRACT_SECTION_ENDPOINT = '/contract-section/paginatedContractSections';
  const bauloseRegimeName = "BBI_PUSH_04"
  test.describe('Search field in Bestandsbau Section list items by pressing Enter', { tag: ['@Admin', '@Admin-Regional'] }, () => {
    let baulouseNameFromFirstRow: string | null;
    let baulouseNameFromSecondRow: string | null;
    test(`Verify Bestandsbau section list items Search field functionality by pressing Enter`, async ({ baulosePage, page }) => {
      await test.step('Verify that Baulose Section List View is opened', async ({ }) => {
        await baulosePage.gotoBestandsbauListSection();
        await baulosePage.expectLoadedBestandsbau();
      });
      await test.step('Verify that Search Input field is visible and button search Icon', async ({ }) => {
        await baulosePage.searchField.expectVisible();
        await expect(baulosePage.searchField.searchIcoButton).toBeVisible();
      });
      await test.step('Verify that the Baulose list is not empty and get the first row item', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        baulouseNameFromFirstRow = await baulosePage.table.rows.first().locator('td').first().locator('div > div').first().textContent();
        await expect(baulouseNameFromFirstRow).not.toBeNull();
        await expect(baulouseNameFromFirstRow).not.toBe('');
      });
      await test.step('Search the Baulose list by pressing Enter and verify the list is updated', async () => {
        await searchByPressingEnterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT, baulouseNameFromFirstRow!);

      });
      await test.step('Verify that the Baulose list is updated and the first row item is the same as searched', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        const firstRowItemAfterSearch: string | null = await baulosePage.table.rows.first().locator('td').first().locator('div > div').first().textContent();
        await expect(firstRowItemAfterSearch).toEqual(baulouseNameFromFirstRow);
        await expect(baulosePage.table.rows.first().locator('td').first().locator('div > div').first()).toHaveText(baulouseNameFromFirstRow!);
        await expect(baulosePage.table.table.getByText(baulouseNameFromFirstRow!)).toBeVisible();
        await expect(baulosePage.table.rows).toHaveCount(1);
      });
      await test.step('Clear the search input field and verify the list is updated', async () => {
        await baulosePage.cleanSearchInput();
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        await expect(baulosePage.table.rows).toHaveCount(25);
      });
    });
    test(`Verify Bestandsbau section list items Search field functionality by clicking Search Icon`, async ({ baulosePage, page }) => {
      await test.step('Verify that Baulose Section List View is opened', async ({ }) => {
        await baulosePage.gotoBestandsbauListSection();
        await baulosePage.expectLoadedBestandsbau();
      });
      await test.step('Verify that Search Input field is visible and button search Icon', async ({ }) => {
        await baulosePage.searchField.expectVisible();
        await expect(baulosePage.searchField.searchIcoButton).toBeVisible();
      });
      await test.step('Verify that the Baulose list is not empty and get the first row item', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        baulouseNameFromSecondRow = await baulosePage.table.rows.nth(1).locator('td').first().locator('div > div').first().textContent();
        await expect(baulouseNameFromSecondRow).not.toBeNull();
        await expect(baulouseNameFromSecondRow).not.toBe('');
      });
      await test.step('Search the Baulose list by clicking the Search Icon and verify the list is updated', async () => {
  await searchByClickingButtonAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT, baulouseNameFromSecondRow!);
});
      
      await test.step('Verify that the Baulose list is updated and the first row item is the same as searched', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        const firstRowItemAfterSearch: string | null = await baulosePage.table.rows.first().locator('td').first().locator('div > div').first().textContent();
        await expect(firstRowItemAfterSearch).toEqual(baulouseNameFromSecondRow);
        await expect(baulosePage.table.rows.first().locator('td').first().locator('div > div').first()).toHaveText(baulouseNameFromSecondRow!);
        await expect(baulosePage.table.table.getByText(baulouseNameFromSecondRow!)).toBeVisible();
        await expect(baulosePage.table.rows).toHaveCount(1);
      });
      await test.step('Clear the search input field and verify the list is updated', async () => {
        await baulosePage.cleanSearchInput();
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        await expect(baulosePage.table.rows).toHaveCount(25);
      });
    });
    test('Verify searching by Bestandsbau regime as text input does not return any results', async ({ baulosePage, page }) => {
      await test.step('Verify that Baulose Section List View is opened', async ({ }) => {
        await baulosePage.gotoBestandsbauListSection();
        await baulosePage.expectLoadedBestandsbau();
      });
      await test.step('Verify that Search Input field is visible and button search Icon', async ({ }) => {
        await baulosePage.searchField.expectVisible();
        await expect(baulosePage.searchField.searchIcoButton).toBeVisible();
      });
      await test.step('Search the Baulose list by pressing Enter and verify the list is updated', async () => {
        await searchByPressingEnterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT, bauloseRegimeName);
      });
      await test.step('Verify that the Baulose list is updated and no results are found', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        await expect(baulosePage.table.rows).toHaveCount(0);
        await expect(baulosePage.emptyStateHeadingBySearchInput).toBeVisible();
        await expect(baulosePage.emptyStateDescriptionBySearchInput).toBeVisible();
      });
    });
  });
  test.describe('Search field in FTTH-AUSBAU Section list items by clicking Search Icon', { tag: ['@Admin', '@Admin-Regional'] }, () => {
    let ftthAusbauNameFromFirstRow: string | null;
    let ftthAusbauNameFromSecondRow: string | null;
    let ftthRegimeName: string | null;
    test(`Verify FTTH-AUSBAU section list items Search field functionality by pressing Enter`, async ({ baulosePage, page }) => {
      await test.step('Verify that FTTH-AUSBAU Section List View is opened', async ({ }) => {
        await baulosePage.gotoFTTHListSection();
        await baulosePage.expectLoadedFTTH();
      });
      await test.step('Verify that Search Input field is visible and button search Icon', async ({ }) => {
        await baulosePage.searchField.expectVisible();
        await expect(baulosePage.searchField.searchIcoButton).toBeVisible();
      });
      await test.step('Verify that the FTTH-AUSBAU list is not empty and get the first row item', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        ftthAusbauNameFromFirstRow = await baulosePage.table.rows.first().locator('td').first().locator('div > div').first().textContent();
        await expect(ftthAusbauNameFromFirstRow).not.toBeNull();
        await expect(ftthAusbauNameFromFirstRow).not.toBe('');
      });
      await test.step('Search the FTTH-AUSBAU list by pressing Enter and verify the list is updated', async () => {
        await searchByPressingEnterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT, ftthAusbauNameFromFirstRow!);

      });
      await test.step('Verify that the FTTH-AUSBAU list is updated and the first row item is the same as searched', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        const firstRowItemAfterSearch: string | null = await baulosePage.table.rows.first().locator('td').first().locator('div > div').first().textContent();
        await expect(firstRowItemAfterSearch).toEqual(ftthAusbauNameFromFirstRow);
        await expect(baulosePage.table.rows.first().locator('td').first().locator('div > div').first()).toHaveText(ftthAusbauNameFromFirstRow!);
        await expect(baulosePage.table.table.getByText(ftthAusbauNameFromFirstRow!)).toBeVisible();
        await expect(baulosePage.table.rows).toHaveCount(1);
      });
      await test.step('Clear the search input field and verify the list is updated', async () => {
        await baulosePage.cleanSearchInput();
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        await expect(baulosePage.table.rows).toHaveCount(25);
      });
    });
    test(`Verify FTTH-AUSBAU section list items Search field functionality by clicking Search Icon`, async ({ baulosePage, page }) => {
      await test.step('Verify that the FTTH-AUSBAU Section List View is opened', async ({ }) => {
        await baulosePage.gotoFTTHListSection();
        await baulosePage.expectLoadedFTTH();
      });
      await test.step('Verify that Search Input field is visible and button search Icon', async ({ }) => {
        await baulosePage.searchField.expectVisible();
        await expect(baulosePage.searchField.searchIcoButton).toBeVisible();
      });
      await test.step('Verify that the FTTH-AUSBAU list is not empty and get the first row item', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        ftthAusbauNameFromSecondRow = await baulosePage.table.rows.nth(1).locator('td').first().locator('div > div').first().textContent();
        await expect(ftthAusbauNameFromSecondRow).not.toBeNull();
        await expect(ftthAusbauNameFromSecondRow).not.toBe('');
      });
      await test.step('Search the FTTH-AUSBAU list by clicking the Search Icon and verify the list is updated', async () => {
        await searchByClickingButtonAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT, ftthAusbauNameFromSecondRow!);
      });
      await test.step('Verify that the FTTH-AUSBAU list is updated and the first row item is the same as searched', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        const firstRowItemAfterSearch: string | null = await baulosePage.table.rows.first().locator('td').first().locator('div > div').first().textContent();
        await expect(firstRowItemAfterSearch).toEqual(ftthAusbauNameFromSecondRow);
        await expect(baulosePage.table.rows.first().locator('td').first().locator('div > div').first()).toHaveText(ftthAusbauNameFromSecondRow!);
        await expect(baulosePage.table.table.getByText(ftthAusbauNameFromSecondRow!)).toBeVisible();
        await expect(baulosePage.table.rows).toHaveCount(1);
      });
      await test.step('Clear the search input field and verify the list is updated', async () => {
        await baulosePage.cleanSearchInput();
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        await expect(baulosePage.table.rows).toHaveCount(25);
      });
    });
    test('Verify searching by FTTH-AUSBAU regime as text input does not return any results', async ({ baulosePage, page }) => {
      await test.step('Verify that Baulose Section List View is opened', async ({ }) => {
        await baulosePage.gotoFTTHListSection();
        await baulosePage.expectLoadedFTTH();
      });
      await test.step('Verify that Search Input field is visible and button search Icon', async ({ }) => {
        await baulosePage.searchField.expectVisible();
        await expect(baulosePage.searchField.searchIcoButton).toBeVisible();
      });
      await test.step('Search the FTTH-AUSBAU list by pressing Enter and verify the list is updated', async () => {
        ftthRegimeName = await baulosePage.table.rows.first().locator('td').first().locator('div > div:nth-child(3)').textContent();
        await expect(ftthRegimeName).not.toBeNull();
        await expect(ftthRegimeName).not.toBe('');
        await searchByPressingEnterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT, ftthRegimeName!);
      });
      await test.step('Verify that the FTTH-AUSBAU list is updated and no results are found', async () => {
        await expect(baulosePage.table.loadingCells).toHaveCount(0);
        await expect(baulosePage.table.rows).toHaveCount(0);
        await expect(baulosePage.emptyStateHeadingBySearchInput).toBeVisible();
        await expect(baulosePage.emptyStateDescriptionBySearchInput).toBeVisible();
      });
    });
  });
});

