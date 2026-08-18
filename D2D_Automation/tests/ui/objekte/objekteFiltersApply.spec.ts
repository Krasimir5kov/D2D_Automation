/**
 * Covers: selecting, applying, and verifying Objekte filter values and
 * their effect on the list results.
 * Does NOT cover: trigger visibility — see objekteFiltersAvailability.spec.ts.
 */
import { expect } from '@playwright/test';
import { test } from '../../../src/fixtures/object.fixture';
import { expectEveryRowColumnToContain } from '../../../src/helpers/filterAssertions';
/*
test.describe('Objekte Page Filters — Apply', { tag: ['@Admin', '@Admin-Regional'] }, () => {
  const objectStatusFilters = [
    { id: 'open', label: 'nicht übergeben' },
    { id: 'rejected', label: 'zurückgewiesen' },
    { id: 'assigned', label: 'übergeben' },
  ];

  test.beforeEach(async ({ objektePage }) => {
    await objektePage.goto();
    await objektePage.expectLoaded();
  });

  for (const statusFilter of objectStatusFilters) {
    test(`Apply the ${statusFilter.label} status filter and verify results`, async ({ page, objektePage }) => {
      const filterChip = page.locator(`#quick-filter-objectStatus-${statusFilter.id}`);

      await test.step(`Select the ${statusFilter.label} quick-filter chip`, async () => {
        await filterChip.click();
      });

      await test.step('Verify the quick-filter chip is selected', async () => {
        await expect(filterChip).toHaveAttribute('aria-pressed', 'true');
      });

      await test.step(`Verify every result has status ${statusFilter.label}`, async () => {
        await expectEveryRowColumnToContain(objektePage, {
          columnIndex: 2,
          expectedText: statusFilter.label,
        });
      });
    });
  }
});
*/
