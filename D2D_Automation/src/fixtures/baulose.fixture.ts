import {test as base, Page } from '@playwright/test';
import { BaulosePage } from '../pages/BaulosePage';
import { SalesActionsPage } from '../pages';

type BauloseFixtures = {
    baulosePage: BaulosePage;
    salesActionsPage : SalesActionsPage;
};

export const test = base.extend<BauloseFixtures>({
    baulosePage:async ({ page}, use) => {
        await use(new BaulosePage(page));
    },
    salesActionsPage: async ({ page }, use) => {
        await use(new SalesActionsPage(page));
    }
});

export { expect } from '@playwright/test';
