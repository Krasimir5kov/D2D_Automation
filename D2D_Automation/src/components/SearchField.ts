import { expect, Locator, Page } from '@playwright/test';

export class SearchField {
    readonly searchIcoButton: Locator;
    readonly cleanSearchInputButton: Locator;
    constructor(
        private readonly page: Page,
        private readonly locator: Locator,
    ) {
        this.cleanSearchInputButton = page.locator('#baulose-search-field').locator('..').getByRole('button').first();
        this.searchIcoButton = page.locator('#baulose-search-field').locator('..').getByRole('button');
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
    async cleanSearchInput(): Promise<void> {
        await this.cleanSearchInputButton.click();
    }
}