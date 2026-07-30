import {test as base } from '@playwright/test';
import { BaulosePage } from '../pages/BaulosePage';

type BauloseFixtures = {
    baulosePage: BaulosePage;
};

export const test = base.extend<BauloseFixtures>({
    baulosePage:async ({ page}, use) => {
        await use(new BaulosePage(page));
    }
});

export { expect } from '@playwright/test';
