/**
 * Covers: the Baulose "Regime" filter — selecting a value, applying it, and asserting
 * the applied chip and list results are correct in both sections.
 * Does NOT cover: trigger visibility — see bauloseFiltersAvailability.spec.ts — or the
 * filter dropdown's own content/structure — see bauloseRegimeFilterDropdown.spec.ts.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';
import { selectFilterChoiceExpandingAllOptions, applyFilterAndWaitForResults } from '../../../src/helpers/filterHelpers';
import { expectEveryRowColumnToContain, expectListIsEmptyWithMessageByFilterDropDown } from '../../../src/helpers/filterAssertions';
import { BESTANDSBAU_COLUMNS, FTTH_COLUMNS } from '../../../src/constants/baulose';

const CONTRACT_SECTION_ENDPOINT = '/contract-section/paginatedContractSections';

test.describe('Baulose Page Filters  — Apply', () => {
  test.beforeEach(async ({ baulosePage }) => {
    await baulosePage.gotoBestandsbauListSection();
    await baulosePage.expectLoadedBestandsbau();
  });
  test.describe('Regime filter', () => {
    const regimeValueFilterOnlyForFTTH = 'VHCN';
    const regimeValueFilterOnlyForFTTH2 = 'ZAG';
    const regimeValueFilterOnlyForBestandsbau = 'FTTB';
    const regimeValueFilterOnlyForBestandsbau2 = 'FTTC';
    test('Apply Regime filter that retrun results only in FTTH-AUSBAU section and Bestandsbau is empty', async ({ page, baulosePage }) => {
      await test.step('Open and Select the Regime Filter Value ', async () => {
        await selectFilterChoiceExpandingAllOptions(baulosePage, () => baulosePage.openRegimeFilter(), regimeValueFilterOnlyForFTTH2);
      })
      await test.step("Verify the Regime checkbox is checked", async () => {
        await expect(baulosePage.filters.choiceCheckbox(regimeValueFilterOnlyForFTTH2)).toBeChecked();
      })
      await test.step("Apply the Regime filter", async () => {
        await applyFilterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT);
        await expect(baulosePage.filters.filterBarChip(regimeValueFilterOnlyForFTTH2)).toBeVisible();
      })
      await test.step("Verify results are correct for the applied Regime Filter in FTTH-AUSBAU section list view", async () => {
        await baulosePage.gotoFTTHListSection();
        await baulosePage.expectLoadedFTTH();
        await expectEveryRowColumnToContain(baulosePage, {
          columnIndex: FTTH_COLUMNS.nameAndRegime,
          expectedText: regimeValueFilterOnlyForFTTH2,
        });
      });
      await test.step("Verify that Bestendsbau list view is empty for the applied Regime Filter", async () => {
        await baulosePage.gotoBestandsbauListSection();
        await baulosePage.expectLoadedBestandsbau();
        await expectListIsEmptyWithMessageByFilterDropDown(baulosePage);
        // await expect(page.getByText("Kein Ergebnis gefunden")).toBeVisible();
        //await expect(page.getByText("          Wählen Sie andere Filter aus, oder setzen Sie alle Filter zurück")).toBeVisible();
      });

    });
    test("Apply Regime Filter Criteria That Returns Results in Bestandsbau List View Only and FTTH-AUSBAU is empty", async ({ page, baulosePage }) => {
      await test.step('Open and Select the Regime Filter value', async () => {
        await selectFilterChoiceExpandingAllOptions(baulosePage, () => baulosePage.openRegimeFilter(), regimeValueFilterOnlyForBestandsbau);
      });
      await test.step("Verify the Regime Option is checked", async () => {
        await expect(baulosePage.filters.choiceCheckbox(regimeValueFilterOnlyForBestandsbau)).toBeChecked();
      });
      await test.step("Apply the Regime Filter", async () => {
        await applyFilterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT);
        await expect(baulosePage.filters.filterBarChip(regimeValueFilterOnlyForBestandsbau)).toBeVisible();
      });
      await test.step("Verify results are correct for the applied Regime Filter in Bestandsbau list view", async () => {
        await expectEveryRowColumnToContain(baulosePage, {
          columnIndex: BESTANDSBAU_COLUMNS.nameAndRegime,
          expectedText: regimeValueFilterOnlyForBestandsbau,
        });
      });
      await test.step("Verify that FTTH-AUSBAU list view is empty for the applied Regime Filter", async () => {
        await baulosePage.gotoFTTHListSection();
        await baulosePage.expectLoadedFTTH();
        await expectListIsEmptyWithMessageByFilterDropDown(baulosePage);
      });
    });
  });
});
