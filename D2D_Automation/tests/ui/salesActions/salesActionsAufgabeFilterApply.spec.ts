/**
 * Covers: the Sales Actions Aufgabe filter — applying it and verifying results.
 * Trigger: salesActionsPage.aufgabeFilter (#salesActionTasks).
 *
 * TODO: write this test — confirm control type via devtools before writing. See
 * reference-sales-actions-filters and project-sales-actions-filters-apply-progress memory
 * for the confirmed locators and plan.
 */
import { test  } from '../../../src/fixtures/salesAction.fixture';
import { expect} from '@playwright/test';

test.describe('Sales Actions Aufgabe Filter Apply', () => {
    test.describe('Apply BESTANDSBAU-Specific Aufgabe Filter Criteria', () => {
        test.beforeEach(async ({ salesActionsPage }) => {
            await salesActionsPage.goToSalesActionPage();
            await salesActionsPage.expectLoadedSalesAction();
        });
        test('Verify BESTANDSBAU-specific Aufgabe filter option updates the list accordingly', async ({ salesActionsPage }) => {
            await test.step('Navigate to Bestandsbau section', async () => {
                await salesActionsPage.gotoBestandsbauSalesAction();
                await salesActionsPage.expectLoadedBestandsbau
            });
            await test.step('Verify Aufgabe filter is visible and available ', async () => {
                await expect(salesActionsPage.aufgabeFilter).toBeVisible();
            });
        });
    });
});
