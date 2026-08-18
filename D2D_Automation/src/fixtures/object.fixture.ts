import {test as base, Page } from '@playwright/test';
import { ObjektePage } from '../pages/ObjektePage';
import { SalesActionsPage } from '../pages';


type ObjekteFixtures = {
    objektePage: ObjektePage;
    page: Page;
    salesActionsPage : SalesActionsPage;
}; 
export const test = base.extend<ObjekteFixtures>({
    objektePage: async ({ page }, use) => {
        await use(new ObjektePage(page));
    },
    salesActionsPage: async ({ page }, use) => {
        await use(new SalesActionsPage(page));
    },
    
});
