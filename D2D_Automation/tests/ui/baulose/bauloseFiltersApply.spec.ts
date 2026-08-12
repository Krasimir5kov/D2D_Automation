/**
 * Covers: Organisation, Regime, Phase, Status — selecting a value, applying it,
 * and asserting the applied chip and list results are correct.
 * Does NOT cover: trigger visibility — see bauloseFiltersAvailability.spec.ts.
 */
import { test, expect } from '../../../src/fixtures/baulose.fixture';
import { selectFilterChoiceThatContainSearchInput, applyFilterAndWaitForResults, selectFilterChoiceWithOutSearchInput } from '../../../src/helpers/filterHelpers';
import { expectEveryRowColumnToContain, expectListIsEmptyWithMessage, expectListIsNotEmpty } from '../../../src/helpers/filterAssertions';
import { BESTANDSBAU_COLUMNS, FTTH_COLUMNS } from '../../../src/constants/baulose';

const CONTRACT_SECTION_ENDPOINT = '/contract-section/paginatedContractSections';

test.describe('Baulose Page Filters  — Apply', () => {
  const organisationFilterOption = 'Freitag Nummer 2';

  test.beforeEach(async ({ baulosePage }) => {
    await baulosePage.gotoBestandsbauListSection();
    await baulosePage.expectLoadedBestandsbau();
  });
  test.describe('Organisation filter', () => {
    test('Apply Organisation filter and verify results', async ({ page, baulosePage }) => {
      await test.step('Open and select the Organisation filter value', async () => {
        await selectFilterChoiceThatContainSearchInput(baulosePage, () => baulosePage.openOrganisationFilter(), organisationFilterOption);
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
    })
  });
  test.describe('Regime filter', () => {
    const regimeValueFilterOnlyForFTTH = 'VHCN';
    const regimeValueFilterOnlyForFTTH2 = 'ZAG';
    const regimeValueFilterOnlyForBestandsbau = 'FTTB';
    const regimeValueFilterOnlyForBestandsbau2 = 'FTTC';
    test('Apply Regime filter that retrun results only in FTTH-AUSBAU section and Bestandsbau is empty', async ({ page, baulosePage }) => {
      await test.step('Open and Select the Regime Filter Value ', async () => {
        await selectFilterChoiceThatContainSearchInput(baulosePage, () => baulosePage.openRegimeFilter(), regimeValueFilterOnlyForFTTH2);
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
        await expectListIsEmptyWithMessage(baulosePage);
        // await expect(page.getByText("Kein Ergebnis gefunden")).toBeVisible();
        //await expect(page.getByText("          Wählen Sie andere Filter aus, oder setzen Sie alle Filter zurück")).toBeVisible();
      });

    });
    test("Apply Regime Filter Criteria That Returns Results in Bestandsbau List View Only and FTTH-AUSBAU is empty", async ({ page, baulosePage }) => {
      await test.step('Open and Select the Regime Filter value', async () => {
        await selectFilterChoiceThatContainSearchInput(baulosePage, () => baulosePage.openRegimeFilter(), regimeValueFilterOnlyForBestandsbau);
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
        await expectListIsEmptyWithMessage(baulosePage);
      });
    });
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
            await expectListIsEmptyWithMessage(baulosePage);
          }
        });
      });
    }
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
              await expectListIsEmptyWithMessage(baulosePage);
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
              await expectListIsEmptyWithMessage(baulosePage);
            }
          });
        });
      }
    });
  });
});
