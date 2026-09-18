/**
 * Covers: the Baulose "Phase" filter — selecting a value, applying it, and asserting
 * the applied chip and list results are correct in both sections.
 * Does NOT cover: trigger visibility — see bauloseFiltersAvailability.spec.ts — or the
 * filter dropdown's own content/structure — see baulosePhaseFilterDropdown.spec.ts.
 */
import { test, expect } from '../../../../src/fixtures/baulose.fixture';
import { selectFilterChoiceWithOutSearchInput, applyFilterAndWaitForResults } from '../../../../src/helpers/filterHelpers';
import { expectEveryRowColumnToContain, expectListIsEmptyWithMessageByFilterDropDown, expectListIsNotEmpty } from '../../../../src/helpers/filterAssertions';
import { FTTH_COLUMNS } from '../../../../src/constants/baulose';
import { BAULOSE_TABLE_PHASE_CHIP_COLORS } from '../../../../src/constants/bauloseTableChipColors';

const CONTRACT_SECTION_ENDPOINT = '/contract-section/paginatedContractSections';

test.describe('Baulose Page Filters  — Apply', () => {
  test.beforeEach(async ({ baulosePage }) => {
    await baulosePage.gotoBestandsbauListSection();
    await baulosePage.expectLoadedBestandsbau();
  });
  test.describe('Phase filter', () => {
    // color is only confirmed for Pre-Contracting/2nd Run — Keine Phase has no confirmed
    // chip color, so it's left undefined and expectEveryRowColumnToContain's color check
    // stays opt-in (same convention used everywhere else this constant pattern is used).
    const phaseValues = [
      { Name: 'Pre-Contracting', expectedInBestandsbau: false, color: BAULOSE_TABLE_PHASE_CHIP_COLORS.preContracting.color },
      { Name: '2nd Run', expectedInBestandsbau: false, color: BAULOSE_TABLE_PHASE_CHIP_COLORS.secondRun.color },
      { Name: 'Keine Phase', expectedInBestandsbau: true, color: undefined }
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
            expectedBackgroundColor: phaseValue.color,
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
