/**
 * Covers: the Baulose "Status" filter — selecting a value, applying it, and asserting
 * the applied chip and list results are correct in both sections.
 * Does NOT cover: trigger visibility — see bauloseFiltersAvailability.spec.ts — or the
 * filter dropdown's own content/structure — see bauloseStatusFilterDropdown.spec.ts.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';
import { selectFilterChoiceThatContainSearchInput, applyFilterAndWaitForResults } from '../../../src/helpers/filterHelpers';
import { expectEveryRowColumnToContain, expectListIsEmptyWithMessageByFilterDropDown } from '../../../src/helpers/filterAssertions';
import { BESTANDSBAU_COLUMNS, FTTH_COLUMNS } from '../../../src/constants/baulose';

const CONTRACT_SECTION_ENDPOINT = '/contract-section/paginatedContractSections';

test.describe('Baulose Page Filters  — Apply', () => {
  test.beforeEach(async ({ baulosePage }) => {
    await baulosePage.gotoBestandsbauListSection();
    await baulosePage.expectLoadedBestandsbau();
  });
  test.describe('Status filter', () => {
    const statusValues = [
      { Name: "ALLOCATION_DETAILPLANNING", expectedInBestandsbau: false, expectedInFTTH: true },
      { Name: "CLOSED", expectedInBestandsbau: true, expectedInFTTH: true },
      { Name: "CONSTRUCTION", expectedInBestandsbau: false, expectedInFTTH: true },
      { Name: "keine Angabe", expectedInBestandsbau: true, expectedInFTTH: false }
    ]
    for (const statusValue of statusValues) {
      test(`Apply Status Filter Option (${statusValue.Name}) and verify results in FTTH-AUSBAU list view`, async ({ page, baulosePage }) => {
        await test.step('Open and Select the Status Filter value', async () => {
          await selectFilterChoiceThatContainSearchInput(baulosePage, () => baulosePage.openStatusFilter(), statusValue.Name);
        });
        await test.step(`Verify the Status Option (${statusValue.Name}) is checked`, async () => {
          await expect(baulosePage.filters.choiceCheckbox(statusValue.Name)).toBeChecked();
        });
        await test.step(`Apply the Status Filter and Verify chip is visible (${statusValue.Name})`, async () => {
          await applyFilterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT);
          await expect(baulosePage.filters.filterBarChip(statusValue.Name)).toBeVisible();
        });
        await test.step(`Verify results in FTTH-AUSBAU list view for the applied Status Filter (${statusValue.Name})`, async () => {
          await baulosePage.gotoFTTHListSection();
          await baulosePage.expectLoadedFTTH();
          if (statusValue.expectedInFTTH) {
            await expectEveryRowColumnToContain(baulosePage, {
              columnIndex: FTTH_COLUMNS.status,
              expectedText: statusValue.Name,
            });
          } else {
            await expectListIsEmptyWithMessageByFilterDropDown(baulosePage);
          }
        });

        await test.step(`Verify results in BESTANDSBAU list view for the applied Status Filter (${statusValue.Name})`, async () => {
          await baulosePage.gotoBestandsbauListSection();
          await baulosePage.expectLoadedBestandsbau();
          if (statusValue.expectedInBestandsbau) {
            await expectEveryRowColumnToContain(baulosePage, {
              columnIndex: BESTANDSBAU_COLUMNS.status,
              expectedText: statusValue.Name,
            });
          } else {
            await expectListIsEmptyWithMessageByFilterDropDown(baulosePage);
          }
        });
      });
    }
  });
});
