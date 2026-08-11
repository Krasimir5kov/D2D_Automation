/**
 * Covers: Organisation, Regime, Phase, Status — selecting a value, applying it,
 * and asserting the applied chip and list results are correct.
 * Does NOT cover: trigger visibility — see bauloseFiltersAvailability.spec.ts.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';
import { selectFilterChoice, applyFilterAndWaitForResults } from '../../../src/helpers/filterHelpers';
import { expectEveryRowColumnToContain } from '../../../src/helpers/filterAssertions';
import { BESTANDSBAU_COLUMNS, FTTH_COLUMNS } from '../../../src/constants/baulose';

const CONTRACT_SECTION_ENDPOINT = '/contract-section/paginatedContractSections';

test.describe('Baulose Page Filters  — Apply', () => {
  const organisationFilterOption = 'Freitag Nummer 2';

  test.beforeEach(async ({ baulosePage }) => {
    await baulosePage.gotoBestandsbauListSection();
    await baulosePage.expectLoadedBestandsbau();
  });

  test('Apply Organisation filter and verify results', async ({ page, baulosePage }) => {
    await test.step('Open and select the Organisation filter value', async () => {
      await selectFilterChoice(baulosePage, () => baulosePage.openOrganisationFilter(), organisationFilterOption);
    });

    await test.step('Verify the Organisation checkbox is checked', async () => {
      await expect(baulosePage.filters.choiceCheckbox(organisationFilterOption)).toBeChecked();
    });

    await test.step('Apply the Organisation filter', async () => {
      await applyFilterAndWaitForResults(page, baulosePage, CONTRACT_SECTION_ENDPOINT);
    });

    await test.step('Verify the applied filter chip is displayed', async () => {
      await expect(baulosePage.filters.filterBarChip(organisationFilterOption)).toBeVisible();
    });

    await test.step('Verify results are correct for the applied organisation filter in Bestandsbau list view', async () => {
      await expectEveryRowColumnToContain(baulosePage, {
        columnIndex: BESTANDSBAU_COLUMNS.organisation,
        expectedText: organisationFilterOption,
      });
    });

    await test.step('Verify results are correct for the applied organisation filter in FTTH-AUSBAU section list view', async () => {
      // No network wait here on purpose — switching tabs may serve data from the app's
      // own client-side cache instead of firing a fresh request, so waitForResponse
      // could hang forever. expectLoadedFTTH() waits for an FTTH-specific table column
      // to appear, which rules out reading stale Bestandsbau rows, and
      // expectEveryRowColumnToContain waits for loading placeholders to clear too.
      await baulosePage.gotoFTTHListSection();
      await baulosePage.expectLoadedFTTH();
      await expectEveryRowColumnToContain(baulosePage, {
        columnIndex: FTTH_COLUMNS.organisationAndPhase,
        expectedText: organisationFilterOption,
      });
    });
  });
});
