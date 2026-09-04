/**
 * Covers: the Baulose "Phase" filter — selecting a value, applying it, and asserting
 * the applied chip and list results are correct in both sections.
 * Does NOT cover: trigger visibility — see bauloseFiltersAvailability.spec.ts — or the
 * filter dropdown's own content/structure — see baulosePhaseFilterDropdown.spec.ts.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';
import { selectFilterChoiceWithOutSearchInput, applyFilterAndWaitForResults } from '../../../src/helpers/filterHelpers';
import { expectEveryRowColumnToContain, expectListIsEmptyWithMessageByFilterDropDown, expectListIsNotEmpty } from '../../../src/helpers/filterAssertions';
import { FTTH_COLUMNS } from '../../../src/constants/baulose';

const CONTRACT_SECTION_ENDPOINT = '/contract-section/paginatedContractSections';

test.describe('Baulose Page Filters  — Apply', () => {
  test.beforeEach(async ({ baulosePage }) => {
    await baulosePage.gotoBestandsbauListSection();
    await baulosePage.expectLoadedBestandsbau();
  });
  test.describe('Phase filter', () => {
    const phaseValues = [
      { Name: 'Pre-Contracting', expectedInBestandsbau: false },
      { Name: '2nd Run', expectedInBestandsbau: false },
      { Name: 'Keine Phase', expectedInBestandsbau: true }
    ];
    for (const phaseValue of phaseValues) {
      test(`Apply Phase filter option (${phaseValue.Name}) and verify results in FTTH-AUSBAU list view`, async ({ page, baulosePage }) => {
        await test.step('Open and Select the Phase Filter value', async () => {
          await selectFilterChoiceWithOutSearchInput(baulosePage, () => baulosePage.openPhaseFilter(), phaseValue.Name);
        });
        await test.step(`Verify the Phase Option (${phaseValue.Name}) is checked`, async () => {
          await expect(baulosePage.filters.choiceCheckbox(phaseValue.Name)).toBeChecked();
        });
        await test.step("Apply the Phase Filter and Verify chip is visible", async () => {
          await applyFilterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT);
          await expect(baulosePage.filters.filterBarChip(phaseValue.Name)).toBeVisible();
        });
        await test.step(`Verify results in FTTH-AUSBAU list view is correct for the applied Phase Filter (${phaseValue.Name})`, async () => {
          await baulosePage.gotoFTTHListSection();
          await baulosePage.expectLoadedFTTH();
          await expectEveryRowColumnToContain(baulosePage, {
            columnIndex: FTTH_COLUMNS.organisationAndPhase,
            expectedText: phaseValue.Name,
          })
        });
        await test.step(`Verify results in BESTANDSBAU list view is empty for the applied Phase Filter (${phaseValue.Name})`, async () => {
          await baulosePage.gotoBestandsbauListSection();
          await baulosePage.expectLoadedBestandsbau();
          if (phaseValue.expectedInBestandsbau) {
            await expectListIsNotEmpty(baulosePage);
          } else {
            await expectListIsEmptyWithMessageByFilterDropDown(baulosePage);
          }
        });
      });
    }
  });
});
