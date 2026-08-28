import { test } from '../../../src/fixtures/object.fixture';
import { expect } from '@playwright/test';
import { expectEveryRowOrganisationToBe } from '../../../src/helpers/filterAssertions';
import {  getFirstRowOrganisationNeubau } from '../../../src/helpers/filterHelpers';

test.describe('Objekte Organisation Filter Apply', () => {
    test.describe('Verify Organisation filter functionality and results in three sections', () => {
        let name = '';
        let fullDisplayText = '';

        test.beforeEach(async ({ objektePage }) => {
            await objektePage.goToObjektePage();
            await objektePage.expectLoadedObjekte();
        });

        test('FTTH-AUSBAU: Filtering by the first row\'s Organisation shows only matching rows', async ({ objektePage }) => {
            await test.step('Go to FTTH-AUSBAU section', async () => {
                await objektePage.gotoFtthSection();
            });
            await test.step('Verify that FTTH-AUSBAU tab section is loaded', async () => {
                await objektePage.expectLoadedFtth();
            });
            await test.step('Get the first row\'s Organisation value', async () => {
                ({ name, fullDisplayText } = await getFirstRowOrganisationNeubau(objektePage));
            });
            await test.step('Open the Organisation filter and select the first row\'s Organisation value', async () => {
                await objektePage.filters.organisationFilterOpen();
                await objektePage.filters.dropDownSearchInput.fill(name);
                await objektePage.filters.choiceLabelButton(name).click();

                await expect(objektePage.filters.choiceCheckbox(name)).toBeChecked();
            });
            await test.step('Apply the filter', async () => {
                await objektePage.filters.applyFilter();
            });
            await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                await expect(objektePage.filters.filterBarChip(name)).toBeVisible();
            });
            await test.step('Verify that the table shows only rows matching the selected Organisation', async () => {
                await expectEveryRowOrganisationToBe(objektePage, fullDisplayText);
            });
        });

        test('BESTANDSBAU: Filtering by the first row\'s Organisation shows only matching rows', async ({ objektePage }) => {
            await test.step('Go to BESTANDSBAU section', async () => {
                await objektePage.gotoBestandsbauSection();
            });
            await test.step('Verify that BESTANDSBAU tab section is loaded', async () => {
                await objektePage.expectLoadedBestandsbau();
            });
            await test.step('Get the first row\'s Organisation value', async () => {
                ({ name, fullDisplayText } = await getFirstRowOrganisationNeubau(objektePage));
            });
            await test.step('Open the Organisation filter and select the first row\'s Organisation value', async () => {
                await objektePage.filters.organisationFilterOpen();
                await objektePage.filters.dropDownSearchInput.fill(name);
                await objektePage.filters.choiceLabelButton(name).click();

                await expect(objektePage.filters.choiceCheckbox(name)).toBeChecked();
            });
            await test.step('Apply the filter', async () => {
                await objektePage.filters.applyFilter();
            });
            await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                await expect(objektePage.filters.filterBarChip(name)).toBeVisible();
            });
            await test.step('Verify that the table shows only rows matching the selected Organisation', async () => {
                await expectEveryRowOrganisationToBe(objektePage, fullDisplayText);
            });
        });

        test('NEUBAU: Filtering by the first row\'s Organisation shows only matching rows', async ({ objektePage }) => {
            await test.step('Go to NEUBAU section', async () => {
                await objektePage.gotoNeubauSection();
            });
            await test.step('Verify that NEUBAU tab section is loaded', async () => {
                await objektePage.expectLoadedNeubau();
            });
            await test.step('Get the first row\'s Organisation value', async () => {
                ({ name, fullDisplayText } = await getFirstRowOrganisationNeubau(objektePage));
            });
            await test.step('Open the Organisation filter and select the first row\'s Organisation value', async () => {
                await objektePage.filters.organisationFilterOpen();
                await objektePage.filters.dropDownSearchInput.fill(name);
                await objektePage.filters.choiceLabelButton(name).click();

                await expect(objektePage.filters.choiceCheckbox(name)).toBeChecked();
            });
            await test.step('Apply the filter', async () => {
                await objektePage.filters.applyFilter();
            });
            await test.step('Verify that chip criteria is visible in the Bar Chip', async () => {
                await expect(objektePage.filters.filterBarChip(name)).toBeVisible();
            });
            await test.step('Verify that the table shows only rows matching the selected Organisation', async () => {
                await expectEveryRowOrganisationToBe(objektePage, fullDisplayText);
            });
        });
    });
});
