/**
 * Covers: the Sales Actions "zugewiesen an" filter — applying it and verifying results.
 * Trigger: salesActionsPage.zugewiesenAnFilter (#salesActionsAssigneesSearch).
 */
import { expect } from '@playwright/test';
import { test } from '../../../../src/fixtures/salesAction.fixture';
import { zugewiesenAnFilterOptions } from '../../../../src/constants/salesActionFiltersValues';
import {
  selectFilterChoiceWithOutSearchInput,
  selectFilterChoiceWithSearchInput,
} from '../../../../src/helpers/filterHelpers';
import { expectEveryRowAssignedUserToBe } from '../../../../src/helpers/filterAssertions';

test.describe('Sales Actions zugewiesen an Filter Apply', { tag: ['@Admin', '@Admin-Regional'] }, () => {
  test.describe('Bestandsbau', () => {
    test.beforeEach(async ({ salesActionsPage }) => {
      await salesActionsPage.gotoBestandsbauSalesAction();
      await salesActionsPage.expectLoadedBestandsbau();
    });

    for (const option of Object.values(zugewiesenAnFilterOptions)) {
      test(`Filter by "${option.label}" and verify every result row`, async ({ salesActionsPage }) => {
        await test.step(`Select "${option.label}"`, async () => {
          if ('searchTerm' in option) {
            await selectFilterChoiceWithSearchInput(
              salesActionsPage,
              () => salesActionsPage.openZugewiesenAnFilterDropDown(),
              option.searchTerm,
              option.label,
            );
          } else {
            await selectFilterChoiceWithOutSearchInput(
              salesActionsPage,
              () => salesActionsPage.openZugewiesenAnFilterDropDown(),
              option.label,
            );
          }
          await expect(salesActionsPage.filters.choiceCheckbox(option.label)).toBeChecked();
        });

        await test.step('Apply the assigned-user filter', async () => {
          await salesActionsPage.filters.applyFilter();
        });

        await test.step('Verify the applied-filter chip is visible', async () => {
          await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
        });

        await test.step(`Verify every Bestandsbau row displays "${option.label}"`, async () => {
          await expectEveryRowAssignedUserToBe(salesActionsPage, option.label);
        });
      });
    }
  });

  test.describe('FTTH-AUSBAU', () => {
    test.beforeEach(async ({ salesActionsPage }) => {
      await salesActionsPage.gotoFtthSalesAction();
      await salesActionsPage.expectLoadedFTTH();
    });

    for (const option of Object.values(zugewiesenAnFilterOptions)) {
      test(`Filter by "${option.label}" and verify every result row`, async ({ salesActionsPage }) => {
        await test.step(`Select "${option.label}"`, async () => {
          if ('searchTerm' in option) {
            await selectFilterChoiceWithSearchInput(
              salesActionsPage,
              () => salesActionsPage.openZugewiesenAnFilterDropDown(),
              option.searchTerm,
              option.label,
            );
          } else {
            await selectFilterChoiceWithOutSearchInput(
              salesActionsPage,
              () => salesActionsPage.openZugewiesenAnFilterDropDown(),
              option.label,
            );
          }
          await expect(salesActionsPage.filters.choiceCheckbox(option.label)).toBeChecked();
        });

        await test.step('Apply the assigned-user filter', async () => {
          await salesActionsPage.filters.applyFilter();
        });

        await test.step('Verify the applied-filter chip is visible', async () => {
          await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
        });

        await test.step(`Verify every FTTH-AUSBAU row displays "${option.label}"`, async () => {
          await expectEveryRowAssignedUserToBe(salesActionsPage, option.label);
        });
      });
    }
  });

  test.describe('Neubau', () => {
    test.beforeEach(async ({ salesActionsPage }) => {
      await salesActionsPage.gotoNeubauSalesAction();
      await salesActionsPage.expectLoadedNeubau();
    });

    for (const option of Object.values(zugewiesenAnFilterOptions)) {
      test(`Filter by "${option.label}" and verify every result row`, async ({ salesActionsPage }) => {
        await test.step(`Select "${option.label}"`, async () => {
          if ('searchTerm' in option) {
            await selectFilterChoiceWithSearchInput(
              salesActionsPage,
              () => salesActionsPage.openZugewiesenAnFilterDropDown(),
              option.searchTerm,
              option.label,
            );
          } else {
            await selectFilterChoiceWithOutSearchInput(
              salesActionsPage,
              () => salesActionsPage.openZugewiesenAnFilterDropDown(),
              option.label,
            );
          }
          await expect(salesActionsPage.filters.choiceCheckbox(option.label)).toBeChecked();
        });

        await test.step('Apply the assigned-user filter', async () => {
          await salesActionsPage.filters.applyFilter();
        });

        await test.step('Verify the applied-filter chip is visible', async () => {
          await expect(salesActionsPage.filters.filterBarChip(option.label)).toBeVisible();
        });

        await test.step(`Verify every Neubau row displays "${option.label}"`, async () => {
          await expectEveryRowAssignedUserToBe(salesActionsPage, option.label);
        });
      });
    }
  });
});
