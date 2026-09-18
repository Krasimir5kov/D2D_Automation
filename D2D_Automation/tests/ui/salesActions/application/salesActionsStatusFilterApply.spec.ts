/**
 * Covers: the Sales Actions Status filter — applying it and verifying results.
 * Trigger: salesActionsPage.statusFilter (#salesActionStatus).
 *
 * Confirmed 2026-09-15 via live row DOM: each row's status cell
 * (#sales-action-row-{id}-status) has a data-status-value enum and a nested
 * [role="status"] chip whose German text matches SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS
 * (e.g. NOT_EXECUTABLE -> "nicht durchführbar"). Row-check reuses expectEveryRowStatusChipToBe,
 * already proven on this page (Ergebnis spec).
 *
 * Section behavior, confirmed 2026-09-16: every status EXCEPT durchgeführt (CARRIED_OUT) is
 * expected to be able to show up in all 3 sections (FTTH-AUSBAU/Bestandsbau/Neubau) - unlike
 * Regime/Aufgabe, Status is not tied to a specific section. durchgeführt is the one exception,
 * Neubau-only (FTTH/Bestandsbau must be empty for it).
 *
 * Data-availability caveat for the "all 3 sections" statuses: this suite currently runs as
 * Admin, who sees more Sales Actions than an Agent/Channel user would. A section legitimately
 * CAN come back with zero matching rows for a given status (not a bug) depending on what test
 * data currently exists — so those checks use expectEveryRowOrEmptyState (same helper already
 * used for Objekte's Verkaufsstart-Termin, same reasoning) instead of a hard row-count
 * assertion: a genuinely empty section still passes, but gets a report annotation flagging it
 * for manual confirmation rather than silently treating "zero rows" as "criterion is correct."
 * TODO (deferred, not yet built): a data-prerequisite/seeding step that guarantees every status
 * has at least one Sales Action in every section before this test runs, which would let these
 * checks become hard assertions instead of tolerant ones.
 */
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { salesActionStatusOptions } from '../../../../src/constants/salesActionFiltersValues';
import { selectFilterChoiceWithOutSearchInput } from '../../../../src/helpers/filterHelpers';
import { expectEveryRowOrEmptyState, expectEveryRowStatusChipToBe, expectListIsEmptyWithMessageByFilterDropDown } from '../../../../src/helpers/filterAssertions';

test.describe('Sales Actions Status Filter Apply', () => {
    for (const [key, option] of Object.entries(salesActionStatusOptions)) {
        const isDurchgefuehrt = key === 'durchgefuehrt';

        test(`Apply Status filter option (${option.chipLabel}) and verify results`, async ({ salesActionsPage }) => {
            await test.step(`Navigate to ${isDurchgefuehrt ? 'Neubau' : 'FTTH-AUSBAU'} section`, async () => {
                if (isDurchgefuehrt) {
                    await salesActionsPage.gotoNeubauSalesAction();
                    await salesActionsPage.expectLoadedNeubau();
                } else {
                    await salesActionsPage.gotoFtthSalesAction();
                    await salesActionsPage.expectLoadedFTTH();
                }
            });
            await test.step(`Select Status option "${option.chipLabel}"`, async () => {
                await selectFilterChoiceWithOutSearchInput(salesActionsPage, () => salesActionsPage.openStatusFilterDropDown(), option.chipLabel);
            });
            await test.step('Apply the filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify chip is visible', async () => {
                await expect(salesActionsPage.filters.filterBarChipPlusPrefix("Status", option.chipLabel)).toBeVisible();
            });

            if (isDurchgefuehrt) {
                await test.step('Verify every row in Neubau shows the selected Status', async () => {
                    await expectEveryRowStatusChipToBe(salesActionsPage, option.listChipLabel, option.color);
                });
                await test.step('Verify FTTH-AUSBAU is empty', async () => {
                    await salesActionsPage.gotoFtthSalesAction();
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                });
                await test.step('Verify Bestandsbau is empty', async () => {
                    await salesActionsPage.gotoBestandsbauSalesAction();
                    await expectListIsEmptyWithMessageByFilterDropDown(salesActionsPage);
                    await expect(salesActionsPage.table.rows).toHaveCount(0);
                });
            } else {
                await test.step('Verify FTTH-AUSBAU rows (or empty, data-dependent)', async () => {
                    await expectEveryRowOrEmptyState(
                        salesActionsPage,
                        () => expectEveryRowStatusChipToBe(salesActionsPage, option.listChipLabel, option.color),
                        `Status "${option.chipLabel}" returned no rows in FTTH-AUSBAU - may be legitimate depending on current test data/user scope (Admin vs Agent/Channel), needs manual confirmation.`,
                    );
                });
                await test.step('Verify Bestandsbau rows (or empty, data-dependent)', async () => {
                    await salesActionsPage.gotoBestandsbauSalesAction();
                    await salesActionsPage.expectLoadedBestandsbau();
                    await expectEveryRowOrEmptyState(
                        salesActionsPage,
                        () => expectEveryRowStatusChipToBe(salesActionsPage, option.listChipLabel, option.color),
                        `Status "${option.chipLabel}" returned no rows in Bestandsbau - may be legitimate depending on current test data/user scope (Admin vs Agent/Channel), needs manual confirmation.`,
                    );
                });
                await test.step('Verify Neubau rows (or empty, data-dependent)', async () => {
                    await salesActionsPage.gotoNeubauSalesAction();
                    await salesActionsPage.expectLoadedNeubau();
                    await expectEveryRowOrEmptyState(
                        salesActionsPage,
                        () => expectEveryRowStatusChipToBe(salesActionsPage, option.listChipLabel, option.color),
                        `Status "${option.chipLabel}" returned no rows in Neubau - may be legitimate depending on current test data/user scope (Admin vs Agent/Channel), needs manual confirmation.`,
                    );
                });
            }
        });
    }
});
