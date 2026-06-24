import { test, expect, type Locator, type Page } from '@playwright/test';
import { BaulosePage } from '../../src/pages/BaulosePage';

test.describe('Baulose List Sections View',  () => {
    test('Verify Baulose List Sections are  Visible', async ({ page }) => {
        const baulosePage = new BaulosePage(page);
        await test.step('Verify FTTH List Section Is Visible', async () => {
            await baulosePage.gotoFTTH();
        });
        await test.step('Verify Bestandsbau List Section Is Visible', async () => {
            await baulosePage.expectLoadedFTTH();
        })
        await test.step('Verify Baulose Search Field Is Visible', async () => {
            await baulosePage.searchField.expectVisible();
        })
        await test.step('Verify search functionality works', async () => {
            await baulosePage.search('1234');
        })
    })
})
