import {expect, Locator, Page} from '@playwright/test';

export class KonfigurationSideBar {
    constructor(
        private readonly page: Page,
    ) {}

    item(name:string | RegExp):Locator{
        return this.page.getByRole('link', {name});
    }
    async openUbersicht():Promise<void>{
        await this.item(/Übersicht/i).click();
    }
    async openAbschlussgruende():Promise<void>{
        await this.item(/Abschlussgründe/i).click();
    }
    async openAufgaben():Promise<void>{
        await this.item(/Aufgaben/i).click();
    }
    async openGruppen():Promise<void>{
        await this.item(/Gruppen/i).click();
    }
    async openRegime():Promise<void>{
        await this.item(/Regime/i).click();
    }
    async openAktivitaetenSetup():Promise<void>{
        await this.item(/Aktivitäten Setup/i).click();
    }
}