/**
 * Covers: the Sales Actions Status filter — applying it and verifying results.
 * Trigger: salesActionsPage.statusFilter (#salesActionStatus).
 *
 * Confirmed 2026-09-15 via live row DOM: each row's status cell
 * (#sales-action-row-{id}-status) has a data-status-value enum and a nested
 * [role="status"] chip whose German text matches SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS
 * (e.g. NOT_EXECUTABLE -> "nicht durchführbar"). Row-check reuses expectEveryRowStatusChipToBe,
 * already proven on this page (Ergebnis spec). Scoped to FTTH-AUSBAU only for now - Status
 * is not yet confirmed to have the same per-section split Regime does.
 *
 * "abgeschlossen" deliberately has no color check here - it's shared by two different
 * background colors (abgeschlossenNegative/abgeschlossenPositive in
 * salesActionsTableChipColors.ts) with no way to tell which one a given row should be
 * without knowing the underlying Ergebnis, so only the label is checked for it.
 * "offen" has a confirmed label but no confirmed color yet. CARRIED_OUT's German label is
 * not confirmed at all and is deliberately left out of salesActionStatusOptions rather
 * than guessed.
 */
import { test } from '../../../src/fixtures/salesAction.fixture';
import { expect } from '@playwright/test';
import { salesActionStatusOptions } from '../../../src/constants/salesActionFiltersValues';
import { SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS } from '../../../src/constants/salesActionsTableChipColors';
import { selectFilterChoiceExpandingAllOptions } from '../../../src/helpers/filterHelpers';
import { expectEveryRowStatusChipToBe } from '../../../src/helpers/filterAssertions';

const STATUS_COLOR_BY_LABEL: Partial<Record<string, string>> = {
    [SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.inbearbeitung.label]: SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.inbearbeitung.color,
    [SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.nichtdurchführbar.label]: SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.nichtdurchführbar.color,
};

test.describe('Sales Actions Status Filter Apply', () => {
    for (const option of Object.values(salesActionStatusOptions)) {
        test(`Apply Status filter option (${option}) and verify results`, async ({ salesActionsPage }) => {
            await test.step('Navigate to FTTH-AUSBAU section', async () => {
                await salesActionsPage.gotoFtthSalesAction();
                await salesActionsPage.expectLoadedFTTH();
            });
            await test.step(`Select Status option "${option}"`, async () => {
                await selectFilterChoiceExpandingAllOptions(salesActionsPage, () => salesActionsPage.openStatusFilterDropDown(), option);
            });
            await test.step('Apply the filter', async () => {
                await salesActionsPage.filters.applyFilter();
            });
            await test.step('Verify chip is visible', async () => {
                await expect(salesActionsPage.filters.filterBarChip(option)).toBeVisible();
            });
            await test.step('Verify every row shows the selected Status', async () => {
                await expectEveryRowStatusChipToBe(salesActionsPage, option, STATUS_COLOR_BY_LABEL[option]);
            });
        });
    }
});
