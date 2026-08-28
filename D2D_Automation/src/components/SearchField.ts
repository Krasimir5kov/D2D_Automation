import { expect, Locator, Page } from '@playwright/test';

export class SearchField {
    readonly searchIcoButton: Locator;
    constructor(
        private readonly page: Page,
        private readonly locator: Locator,
    ) {
        this.searchIcoButton =  page.locator('button.search-button.icon-a1-lupe')
    }


    async triggerSearchByPressingEnter(text: string): Promise<void> {
        await this.locator.fill(text);
        await this.locator.press('Enter');
    }
    async triggerSearchByClickingSearchButton(text: string): Promise<void> {
        await this.locator.fill(text);
        await this.searchIcoButton.click();
    }

    async expectVisible(): Promise<void> {
        await expect(this.locator).toBeVisible();
    }
}