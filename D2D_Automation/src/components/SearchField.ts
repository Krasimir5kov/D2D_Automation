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

    // Asserts the "floating label" text shown next to the search input — NOT a native
    // placeholder attribute. Every search field in this app renders
    // <label for="{input-id}"><span>{text}</span></label> as a sibling of the <input>,
    // inside a shared wrapper, so this climbs to that wrapper and checks the label text
    // there instead of a placeholder attribute that doesn't actually exist.
    async expectPlaceholder(text: string | RegExp): Promise<void> {
        await expect(this.locator.locator('..').getByText(text)).toBeVisible();
    }
}