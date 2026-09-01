import { test as base, Page } from '@playwright/test';
import { ObjektePage } from '../pages/ObjektePage';
import { SalesActionsPage } from '../pages/SalesActionsPage';

type SalesActionsFixtures = {
    salesActionsPage: SalesActionsPage;
    page: Page;}

    export const test = base.extend<SalesActionsFixtures>({
    salesActionsPage: async ({ page }, use) => {
        await use(new SalesActionsPage(page));
    },
});