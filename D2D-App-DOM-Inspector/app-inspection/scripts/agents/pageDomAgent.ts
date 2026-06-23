import { Page } from '@playwright/test';
import {
  captureAndSaveDom,
  collectAllPageElements,
  cleanHtml,
} from '../../helpers/dom-capture';
import {
  screenshotPath,
  domPath,
  accessibilityPath,
  saveHtml,
  saveText,
  humanTimestamp,
} from '../../helpers/filesystem';
import { ElementInfo } from '../../helpers/dom-capture';
import { ListSectionInfo } from '../../helpers/reporter';

export interface CapturedPageState {
  url: string;
  title: string;
  timestamp: string;
  screenshotPath: string;
  domPath: string;
  a11yPath: string;
  elements: {
    buttons: ElementInfo[];
    links: ElementInfo[];
    inputs: ElementInfo[];
    selects: ElementInfo[];
    checkboxes: ElementInfo[];
    tabs: ElementInfo[];
  };
  listSections: ListSectionInfo[];
}

export async function takePageScreenshot(page: Page, name: string): Promise<string> {
  const filePath = screenshotPath(name);
  try {
    await page.screenshot({ path: filePath, fullPage: false });
  } catch (err) {
    console.log(`  [DOM AGENT] Screenshot failed for "${name}": ${err}`);
  }
  return filePath;
}

export async function capturePageState(page: Page, pageId: string): Promise<CapturedPageState> {
  const ssPath = await takePageScreenshot(page, `${pageId}-main`);
  const dPath = domPath(`${pageId}-main`);
  const aPath = accessibilityPath(`${pageId}-main`);

  await captureAndSaveDom(page, pageId, dPath, aPath);
  const elements = await collectAllPageElements(page);

  return {
    url: page.url(),
    title: await page.title(),
    timestamp: humanTimestamp(),
    screenshotPath: ssPath,
    domPath: dPath,
    a11yPath: aPath,
    elements,
    listSections: [],
  };
}

export async function captureListSections(
  page: Page,
  knownSections: string[]
): Promise<ListSectionInfo[]> {
  const sections: ListSectionInfo[] = [];

  if (knownSections.length > 0) {
    for (const sectionName of knownSections) {
      try {
        const items = await page.evaluate((name) => {
          const headings = Array.from(
            document.querySelectorAll('h1,h2,h3,h4,h5,[class*="section-title"],[class*="header"],[class*="title"],[class*="group"]')
          );
          const heading = headings.find((h) => (h as HTMLElement).innerText?.includes(name));
          if (!heading) return { count: 0, items: [], buttons: [] };

          const parent =
            heading.closest('[class*="section"], [class*="list"], [class*="panel"], [class*="container"]') ||
            heading.parentElement;
          if (!parent) return { count: 0, items: [], buttons: [] };

          const listItems = Array.from(parent.querySelectorAll('li, [class*="item"], [class*="row"], tr'))
            .filter((el) => {
              const r = (el as HTMLElement).getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            })
            .slice(0, 20)
            .map((el) => (el as HTMLElement).innerText?.trim().split('\n')[0] || '');

          const buttons = Array.from(parent.querySelectorAll('button, [role="button"]'))
            .filter((el) => {
              const r = (el as HTMLElement).getBoundingClientRect();
              return r.width > 0 && r.height > 0;
            })
            .slice(0, 10)
            .map((el) => (el as HTMLElement).innerText?.trim() || el.getAttribute('aria-label') || '');

          return { count: listItems.length, items: listItems, buttons };
        }, sectionName);

        sections.push({
          name: sectionName,
          itemCount: items.count,
          visibleItems: items.items.filter(Boolean).slice(0, 5),
          buttons: items.buttons.filter(Boolean),
        });
      } catch (err) {
        sections.push({ name: sectionName, itemCount: 0, visibleItems: [], buttons: [] });
      }
    }
  } else {
    // Auto-discover section headings
    const discovered = await page.evaluate(() => {
      const headings = Array.from(
        document.querySelectorAll(
          'h1,h2,h3,h4,[class*="section-title"],[class*="group-title"],[class*="list-header"],[class*="tab-label"]'
        )
      );
      return headings
        .filter((h) => {
          const r = (h as HTMLElement).getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        })
        .slice(0, 15)
        .map((h) => (h as HTMLElement).innerText?.trim() || '')
        .filter(Boolean);
    });

    for (const name of discovered) {
      sections.push({ name, itemCount: 0, visibleItems: [], buttons: [] });
    }
  }

  return sections;
}

export async function captureModalOrPanelDom(
  page: Page,
  name: string
): Promise<{ html: string; savedPath: string }> {
  const html = await page.evaluate(() => {
    const candidates = [
      document.querySelector('[role="dialog"]'),
      document.querySelector('mat-dialog-container'),
      document.querySelector('[class*="side-panel"]'),
      document.querySelector('[class*="drawer"]'),
    ];
    const el = candidates.find((c) => {
      if (!c) return false;
      const r = (c as HTMLElement).getBoundingClientRect();
      return r.width > 80 && r.height > 40;
    });
    return el ? (el as HTMLElement).outerHTML : '';
  });

  const cleaned = cleanHtml(html);
  const filePath = domPath(name);
  saveHtml(filePath, cleaned);
  return { html: cleaned, savedPath: filePath };
}
