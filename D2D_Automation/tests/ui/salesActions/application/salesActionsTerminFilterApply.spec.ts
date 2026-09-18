/**
 * Covers: the Sales Actions Termin filter, "mit Termin" and "ohne Termin" options.
 * Trigger: salesActionsPage.terminFilter (#appointment).
 *
 * Confirmed 2026-09-16: unlike Planskizze/Bestellung über D2D, "mit Termin" is NOT
 * FTTH-only — it's relevant for FTTH-AUSBAU and BESTANDSBAU; NEUBAU always returns an
 * empty list for it. "ohne Termin" is confirmed relevant for ALL THREE sections, Neubau
 * included — no section is expected to be empty for it.
 *
 * A matching row has no visible column/chip for this (unlike Regime/Phase), so the only
 * way to verify it is inside the side panel's AKTIVITÄTEN tab. Confirmed via live DOM:
 * whenever a customer-interaction/appointment activity has a scheduled Termin, a
 * "Termin DD.MM.YYYY HH:MM - HH:MM" badge (plus stattgefunden/nicht stattgefunden/
 * verschoben status) renders directly in its accordion header — no click/expand needed.
 * An activity with no Termin omits this badge entirely (no empty placeholder), and the
 * word "Termin" doesn't appear anywhere else in this tab — so this text is a safe, direct
 * proof either way (see SalesActionsPage.expectAktivitatenHasAtLeastOneTermin /
 * expectAktivitatenHasNoTermin).
 *
 * Since a single row is weaker evidence here than for a table-visible chip, this checks
 * the first 10 rows (or fewer if the filtered list is shorter) via
 * filterAssertions.expectFirstNRowsSatisfy, not just the first one.
 *
 * TODO (out of scope today): mitTerminHeute, mitTerminImZeitraum — the other 2 options in
 * terminFilterOptions — still need their own tests.
 */
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { terminFilterOptions, salesActionTypeFilterOptions } from '../../../../src/constants/salesActionFiltersValues';
import { expectFirstNRowsSatisfy, expectListIsEmptyWithMessageByFilterDropDown, expectTableSettled } from '../../../../src/helpers/filterAssertions';
import { selectFilterChoiceExpandingAllOptions } from '../../../../src/helpers/filterHelpers';
import { SALES_ACTION_FILTER_TITLES_AND_ID } from '../../../../src/constants/salesActionFiltersTitle';

test.describe('Sales Actions Termin Filter Apply', { tag: ['@Admin', '@Admin-Regional', '@Channel', '@Agent'] }, () => {
    test.describe('Apply mit Termin option and check three different list section results', () => {
        test('FTTH-AUSBAU: Verify that mit Termin option updates list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Open Termin filter dropdown', async () => {
                await salesActionsPage.openTerminFilterDropDown();
            });
            await test.step('Select mit Termin option in Termin filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(terminFilterOptions.mitTermin.label).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(terminFilterOptions.mitTermin.label)).toBeChecked();
            });
            await test.step('Apply Termin filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.appointment.label, terminFilterOptions.mitTermin.label)).toBeVisible();
            });
            await test.step('Verify that the first 10 sales actions each have at least one Termin in Aktivitäten', async () => {
                await expectFirstNRowsSatisfy(salesActionsPage, async (row) => {
                    await row.click();
                    await salesActionsPage.expectFtthSalesActionSidePanelOpen();
                    await salesActionsPage.openAktivitenSidePanelSection();
                    await salesActionsPage.expectAktivitatenHasAtLeastOneTermin();
                    await salesActionsPage.ftthSidePanel.close();
                });
            });
        });
        test('NEUBAU: Verify that mit Termin option returns no results', async ({ salesActionsPage }) => {
            await test.step('Navigate to NEUBAU sales action section', async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedNeubau();
            });
            await test.step('Open Termin filter dropdown', async () => {
                await salesActionsPage.openTerminFilterDropDown();
            });
            await test.step('Select mit Termin option in Termin filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(terminFilterOptions.mitTermin.label).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(terminFilterOptions.mitTermin.label)).toBeChecked();
            });
            await test.step('Apply Termin filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.appointment.label, terminFilterOptions.mitTermin.label)).toBeVisible();
            });
            await test.step('Verify that no results are returned', async () => {
                await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                await expect(salesActionsPage.table.rows).toHaveCount(0);
            });
        });
        test('BESTANDSBAU: Verify that mit Termin option updates list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to BESTANDSBAU sales action section', async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedBestandsbau();
            });
            await test.step('Open Termin filter dropdown', async () => {
                await salesActionsPage.openTerminFilterDropDown();
            });
            await test.step('Select mit Termin option in Termin filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(terminFilterOptions.mitTermin.label).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(terminFilterOptions.mitTermin.label)).toBeChecked();
            });
            await test.step('Apply Termin filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.appointment.label, terminFilterOptions.mitTermin.label)).toBeVisible();
            });
            await test.step('Verify that the first 10 rows each have at least one Termin in Aktivitäten', async () => {
                await expectFirstNRowsSatisfy(salesActionsPage, async (row) => {
                    await row.click();
                    await salesActionsPage.expectBestandsbauSalesActionSidePanelOpen();
                    await salesActionsPage.openAktivitenSidePanelSection();
                    await salesActionsPage.expectAktivitatenHasAtLeastOneTermin();
                    await salesActionsPage.bestandsbauSidePanel.close();
                });
            });
        });
    });

    test.describe('Apply ohne Termin option and check three different list section results', () => {
        test('FTTH-AUSBAU: Verify that ohne Termin option updates list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to Sales Action Page', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step('Open Termin filter dropdown', async () => {
                await salesActionsPage.openTerminFilterDropDown();
            });
            await test.step('Select ohne Termin option in Termin filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(terminFilterOptions.ohneTermin.label).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(terminFilterOptions.ohneTermin.label)).toBeChecked();
            });
            await test.step('Apply Termin filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.appointment.label, terminFilterOptions.ohneTermin.label)).toBeVisible();
            });
            await test.step('Verify that the first 10 rows each have no Termin in Aktivitäten', async () => {
                await expectFirstNRowsSatisfy(salesActionsPage, async (row) => {
                    await row.click();
                    await salesActionsPage.expectFtthSalesActionSidePanelOpen();
                    await salesActionsPage.openAktivitenSidePanelSection();
                    await salesActionsPage.expectAktivitatenHasNoTermin();
                    await salesActionsPage.ftthSidePanel.close();
                });
            });
        });
        test('NEUBAU: Verify that ohne Termin option updates list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to NEUBAU sales action section', async () => {
                await salesActionsPage.gotoNeubauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedNeubau();
            });
            await test.step('Open Termin filter dropdown', async () => {
                await salesActionsPage.openTerminFilterDropDown();
            });
            await test.step('Select ohne Termin option in Termin filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(terminFilterOptions.ohneTermin.label).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(terminFilterOptions.ohneTermin.label)).toBeChecked();
            });
            await test.step('Apply Termin filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.appointment.label, terminFilterOptions.ohneTermin.label)).toBeVisible();
            });
            // Neubau's list mixes "Objekt Sales Action" rows (advertising/marketing —
            // Bauträger Übergabemappe, Mieterliste, etc. — no customer interaction at all,
            // not even the ÜBERSICHT/AKTIVITÄTEN side panel tabs) with "D2D Sales Action"
            // rows (which do have those tabs). Termin only makes sense for the latter, so
            // the Sales Action-Type filter narrows to D2D Verkauf before sampling rows.
            // Sales Action-Type has more choices than fit without truncation, so
            // selectFilterChoiceExpandingAllOptions() is used instead of the plain
            // open+choiceLabelButton pair — it clicks FilterBar's "weitere anzeigen"
            // button first (only if present), same as Aufgabe/Regime/Ergebnis already do.
            await test.step('Open Sales Action-Type filter dropdown and select D2D Verkauf', async () => {
                await selectFilterChoiceExpandingAllOptions(
                    salesActionsPage,
                    () => salesActionsPage.openSalesActionTypeFilterDropDown(),
                    salesActionTypeFilterOptions.d2dVerkauf.label,
                );
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceCheckbox(salesActionTypeFilterOptions.d2dVerkauf.label)).toBeChecked();
            });
            await test.step('Apply Sales Action-Type filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChip(salesActionTypeFilterOptions.d2dVerkauf.label)).toBeVisible();
            });
            await test.step('Verify that the first 10 rows each have no Termin in Aktivitäten', async () => {
                await expectFirstNRowsSatisfy(salesActionsPage, async (row) => {
                    await row.click();
                    await salesActionsPage.expectNeubauSalesActionSidePanelOpen();
                    await salesActionsPage.openAktivitenSidePanelSection();
                    await salesActionsPage.expectAktivitatenHasNoTermin();
                    await salesActionsPage.neubauSidePanel.close();
                });
            });
        });
        // FIXME (2026-09-16): fails live — "ohne Termin" on BESTANDSBAU returns some rows
        // that actually DO have a Termin. Hypothesis, not yet confirmed by the team: on
        // BESTANDSBAU a "D2D Verkauf" sales action automatically becomes
        // "A1 Internet Ready Check" once it gets a Termin (system-driven type change) —
        // if the "ohne Termin" filter doesn't exclude a1InternetReadyCheck rows the same
        // way Neubau's "D2D Verkauf" Sales Action-Type step excludes Objekt Sales Action
        // rows above, this contradiction is exactly what you'd expect to see. Needs a
        // decision from the lead/designer before this test can be fixed for real: should
        // "ohne Termin" on BESTANDSBAU also be scoped to a specific Sales Action-Type, and
        // if so which one(s)? Left as test.fixme() until that's answered — do not silently
        // "fix" this by guessing the intended behavior.
        test.fixme('BESTANDSBAU: Verify that ohne Termin option updates list items accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to BESTANDSBAU sales action section', async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await expectTableSettled(salesActionsPage);
                await salesActionsPage.expectLoadedBestandsbau();
            });
            await test.step('Open Termin filter dropdown', async () => {
                await salesActionsPage.openTerminFilterDropDown();
            });
            await test.step('Select ohne Termin option in Termin filter', async () => {
                await salesActionsPage.filters.choiceLabelButton(terminFilterOptions.ohneTermin.label).click();
            });
            await test.step('Verify that the option is checked', async () => {
                await expect(salesActionsPage.filters.choiceRadio(terminFilterOptions.ohneTermin.label)).toBeChecked();
            });
            await test.step('Apply Termin filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify that filter chip is displayed correctly', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix(SALES_ACTION_FILTER_TITLES_AND_ID.appointment.label, terminFilterOptions.ohneTermin.label)).toBeVisible();
            });
            await test.step('Verify that the first 10 rows each have no Termin in Aktivitäten', async () => {
                await expectFirstNRowsSatisfy(salesActionsPage, async (row) => {
                    await row.click();
                    await salesActionsPage.expectBestandsbauSalesActionSidePanelOpen();
                    await salesActionsPage.openAktivitenSidePanelSection();
                    await salesActionsPage.expectAktivitatenHasNoTermin();
                    await salesActionsPage.bestandsbauSidePanel.close();
                });
            });
        });
    });
});
