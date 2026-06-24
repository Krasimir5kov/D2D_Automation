import {expect, Locator, Page} from '@playwright/test';

export class SearchField {
    constructor(
        private readonly page: Page,
        private readonly locator: Locator
    ) {}
    

    async search(text:string):Promise<void>{
        await this.locator.fill(text);
        await this.locator.press('Enter');
    }
    
    async expectVisible():Promise<void>{
        await expect(this.locator).toBeVisible();
    }
}