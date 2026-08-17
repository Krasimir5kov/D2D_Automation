/**
 * Covers: every top-level Door2Door section is reachable and shows its
 * defining content right after login — a broad availability smoke test,
 * not a deep functional check (see the per-page suites for that).
 */
import { test ,expect,type Page } from '@playwright/test';
import {BaulosePage,
    ObjektePage,
    SalesActionsPage,
    BenutzerverwaltungPage,
    ImportePage,
    KonfigurationPage} from '../../../src/pages';

test.describe('Smoke Test: All Door2Door Pages and Sections',{tag: ['@Admin','@Admin-Regional']}, () => {
    const PAGES_TO_SMOKE_TEST = [
        { name: 'Baulose',
            open: (page: Page) => new BaulosePage(page).gotoBestandsbauListSection(),
            verify : (page: Page) => new BaulosePage(page).expectLoadedBestandsbau() },
        { name: 'Objekte',
            open: (page: Page) => new ObjektePage(page).goto(),
            verify : (page: Page) => new ObjektePage(page).expectLoaded() },
        { name: 'Sales Actions',
            open: (page: Page) => new SalesActionsPage(page).goto(),
            verify : (page: Page) => new SalesActionsPage(page).expectLoadedNeubau() },
        { name: 'Benutzerverwaltung',
            open: (page: Page) => new BenutzerverwaltungPage(page).goto(),
            verify : (page: Page) => new BenutzerverwaltungPage(page).expectLoaded() },
        { name: 'Importe', 
              open: (page: Page) => new ImportePage(page).goto(),
                verify : (page: Page) => new ImportePage(page).expectLoaded() },
        { name: 'Konfiguration',
              open: (page: Page) => new KonfigurationPage(page).goto(),
                verify : (page: Page) => new KonfigurationPage(page).expectLoaded() }

    ];
    for ( const pageInfo of PAGES_TO_SMOKE_TEST) {
        test(`${pageInfo.name} page smoke test`, async ({ page }) => {
            await test.step(`Open ${pageInfo.name} page`, async () => {
                await pageInfo.open(page);
            });
            await test.step(`Verify ${pageInfo.name} page`, async () => {
                await pageInfo.verify(page);
            });
        });
    }
});

type SectionSmokeTest = {
    pageName: string;
    sectionName: string;
    landOnPage: (page: Page) => Promise<void>;
    openTab: (page: Page) => Promise<void>;
    verifyOpened: (page: Page) => Promise<void>;
};

const SECTIONS_TO_SMOKE_TEST: SectionSmokeTest[] = [
    // Baulose — 2 sections
    {
        pageName: 'Baulose', sectionName: 'Bestandsbau',
        landOnPage: (page) => new BaulosePage(page).gotoBestandsbauListSection(),
        openTab: (page) => new BaulosePage(page).bestandsbauTab.click(),
        verifyOpened: async (page) => {
            const baulosePage = new BaulosePage(page);
            await baulosePage.expectLoadedBestandsbau();
            await baulosePage.table.expectVisible();
        },
    },
    {
        pageName: 'Baulose', sectionName: 'FTTH-AUSBAU',
        landOnPage: (page) => new BaulosePage(page).gotoBestandsbauListSection(),
        openTab: (page) => new BaulosePage(page).ftthTab.click(),
        verifyOpened: async (page) => {
            const baulosePage = new BaulosePage(page);
            await baulosePage.expectLoadedFTTH();
            await baulosePage.table.expectVisible();
        },
    },
    // Objekte — 3 sections. ObjektePage only has a Neubau-specific expectLoaded(), so
    // FTTH/Bestandsbau are verified with an inline URL check instead of a new page-object
    // method (kept out of scope here on purpose — smoke test file only).
    {
        pageName: 'Objekte', sectionName: 'Neubau',
        landOnPage: (page) => new ObjektePage(page).goto(),
        openTab: (page) => new ObjektePage(page).neubauTab.click(),
        verifyOpened: async (page) => {
            await new ObjektePage(page).expectLoaded();
            await new ObjektePage(page).table.expectVisible();
        },
    },
    {
        pageName: 'Objekte', sectionName: 'FTTH-AUSBAU',
        landOnPage: (page) => new ObjektePage(page).goto(),
        openTab: (page) => new ObjektePage(page).ftthTab.click(),
        verifyOpened: async (page) => {
            await expect(page).toHaveURL(/\/door2door#\/objekte\/ftth/);
            await new ObjektePage(page).table.expectVisible();
        },
    },
    {
        pageName: 'Objekte', sectionName: 'Bestandsbau',
        landOnPage: (page) => new ObjektePage(page).goto(),
        openTab: (page) => new ObjektePage(page).bestandsbauTab.click(),
        verifyOpened: async (page) => {
            await expect(page).toHaveURL(/\/door2door#\/objekte\/bestandsbau/);
            await new ObjektePage(page).table.expectVisible();
        },
    },
    // Sales Actions — 3 sections, dedicated expectLoaded* methods already exist
    {
        pageName: 'Sales Actions', sectionName: 'Neubau',
        landOnPage: (page) => new SalesActionsPage(page).goto(),
        openTab: (page) => new SalesActionsPage(page).neubauTab.click(),
        verifyOpened: async (page) => {
            const salesActionsPage = new SalesActionsPage(page);
            await salesActionsPage.expectLoadedNeubau();
            await salesActionsPage.table.expectVisible();
        },
    },
    {
        pageName: 'Sales Actions', sectionName: 'FTTH-AUSBAU',
        landOnPage: (page) => new SalesActionsPage(page).goto(),
        openTab: (page) => new SalesActionsPage(page).ftthTab.click(),
        verifyOpened: async (page) => {
            const salesActionsPage = new SalesActionsPage(page);
            await salesActionsPage.expectLoadedFTTH();
            await salesActionsPage.table.expectVisible();
        },
    },
    {
        pageName: 'Sales Actions', sectionName: 'Bestandsbau',
        landOnPage: (page) => new SalesActionsPage(page).goto(),
        openTab: (page) => new SalesActionsPage(page).bestandsbauTab.click(),
        verifyOpened: async (page) => {
            const salesActionsPage = new SalesActionsPage(page);
            await salesActionsPage.expectLoadedBestandsbau();
            await salesActionsPage.table.expectVisible();
        },
    },
];

test.describe('Smoke — Section Tabs Available and Openable', { tag: ['@Admin', '@Admin-Regional'] }, () => {
    for (const section of SECTIONS_TO_SMOKE_TEST) {
        test(`${section.pageName} — ${section.sectionName} tab is available and opens the correct list view`, async ({ page }) => {
            await test.step(`Land on ${section.pageName}`, async () => {
                await section.landOnPage(page);
            });
            await test.step(`Click the ${section.sectionName} tab`, async () => {
                await section.openTab(page);
            });
            await test.step(`Verify ${section.sectionName} section opened with a visible table`, async () => {
                await section.verifyOpened(page);
            });
        });
    }
});