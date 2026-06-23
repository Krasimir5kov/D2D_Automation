import { Page } from '@playwright/test';
import {
  screenshotPath,
  domPath,
  accessibilityPath,
  saveHtml,
  saveText,
  sanitizeFilename,
} from '../../helpers/filesystem';
import { cleanHtml } from '../../helpers/dom-capture';
import { SidePanelInfo, LocatorSuggestion } from '../../helpers/reporter';

const PANEL_SELECTORS = [
  '[class*="side-panel"]',
  '[class*="sidepanel"]',
  '[class*="drawer"]',
  '[role="complementary"]',
  '[class*="detail-panel"]',
  '[class*="detail-view"]',
  '[class*="split-right"]',
  '[class*="right-panel"]',
];

export async function isSidePanelOpen(page: Page): Promise<boolean> {
  return page.evaluate((selectors) => {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          const r = (el as HTMLElement).getBoundingClientRect();
          if (r.width > 200 && r.height > 200) return true;
        }
      } catch { /* continue */ }
    }
    return false;
  }, PANEL_SELECTORS);
}

async function extractPanelContent(page: Page) {
  return page.evaluate((selectors) => {
    let panel: Element | null = null;
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          const r = (el as HTMLElement).getBoundingClientRect();
          if (r.width > 200 && r.height > 100) { panel = el; break; }
        }
      } catch { /* continue */ }
    }
    if (!panel) return { sections: [], fields: [], buttons: [], tabs: [], statusFields: [] };

    const sections = Array.from(
      panel.querySelectorAll('h1,h2,h3,h4,h5,[class*="section-title"],[class*="panel-title"],[class*="card-title"]')
    )
      .map((e) => (e as HTMLElement).innerText?.trim() || '')
      .filter(Boolean)
      .slice(0, 20);

    const fields = Array.from(
      panel.querySelectorAll('label, dt, [class*="field-label"], [class*="label-text"], [class*="property-name"]')
    )
      .map((e) => (e as HTMLElement).innerText?.trim() || '')
      .filter(Boolean)
      .slice(0, 40);

    const statusFields = Array.from(
      panel.querySelectorAll('[class*="status"], [class*="badge"], [class*="chip"], [class*="tag"], [class*="state"]')
    )
      .filter((e) => { const r = (e as HTMLElement).getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((e) => (e as HTMLElement).innerText?.trim() || '')
      .filter(Boolean)
      .slice(0, 20);

    const buttons = Array.from(panel.querySelectorAll('button, [role="button"]'))
      .filter((e) => { const r = (e as HTMLElement).getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((e) => (e as HTMLElement).innerText?.trim() || e.getAttribute('aria-label') || '')
      .filter(Boolean)
      .slice(0, 20);

    const tabs = Array.from(panel.querySelectorAll('[role="tab"], [class*="tab"]'))
      .map((e) => (e as HTMLElement).innerText?.trim() || '')
      .filter(Boolean)
      .slice(0, 10);

    return { sections, fields, buttons, tabs, statusFields };
  }, PANEL_SELECTORS);
}

async function capturePanelDom(page: Page): Promise<string> {
  const html = await page.evaluate((selectors) => {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) {
          const r = (el as HTMLElement).getBoundingClientRect();
          if (r.width > 200) return (el as HTMLElement).outerHTML;
        }
      } catch { /* continue */ }
    }
    return '';
  }, PANEL_SELECTORS);
  return cleanHtml(html);
}

export async function clickSectionItemAndInspect(
  page: Page,
  pageId: string,
  sectionName: string,
  pageUrl: string
): Promise<SidePanelInfo | null> {
  try {
    // Find first clickable item in the section
    const firstItemText = await page.evaluate((name) => {
      const headings = Array.from(
        document.querySelectorAll('h1,h2,h3,h4,h5,[class*="section-title"],[class*="header"],[class*="group-title"]')
      );
      const heading = headings.find((h) => (h as HTMLElement).innerText?.includes(name));
      if (!heading) return '';

      const parent =
        heading.closest('[class*="section"], [class*="list"], [class*="container"], [class*="group"]') ||
        heading.parentElement;
      if (!parent) return '';

      const items = Array.from(
        parent.querySelectorAll('li, [class*="item"], [class*="row"], [class*="card"]')
      ).filter((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return r.width > 10 && r.height > 10;
      });

      return items.length > 0 ? (items[0] as HTMLElement).innerText?.trim().split('\n')[0] || '' : '';
    }, sectionName);

    if (!firstItemText || firstItemText.length < 2) {
      console.log(`  [SIDE PANEL] No clickable items found in "${sectionName}"`);
      return null;
    }

    // Click the item
    const itemLocator = page.getByText(firstItemText, { exact: false }).first();
    const itemVisible = await itemLocator.isVisible({ timeout: 2000 }).catch(() => false);
    if (!itemVisible) return null;

    await itemLocator.click({ timeout: 3000 });
    await page.waitForTimeout(1200);

    if (!(await isSidePanelOpen(page))) {
      console.log(`  [SIDE PANEL] Click on "${firstItemText}" did not open a side panel`);
      return null;
    }

    console.log(`  [SIDE PANEL] Opened for "${firstItemText}" in ${sectionName}`);

    return await inspectOpenSidePanel(page, pageId, `${sectionName}: ${firstItemText}`, pageUrl);

  } catch (err) {
    console.log(`  [SIDE PANEL ERROR] ${sectionName}: ${err}`);
    await page.goto(pageUrl, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
    return null;
  }
}

export async function inspectOpenSidePanel(
  page: Page,
  pageId: string,
  context: string,
  pageUrl: string
): Promise<SidePanelInfo | null> {
  const spName = `${pageId}-side-panel-${sanitizeFilename(context)}`;
  const spScreenshot = screenshotPath(spName);
  const spDomPath = domPath(spName);
  const spA11yPath = accessibilityPath(spName);

  try {
    // Screenshot
    await page.screenshot({ path: spScreenshot, fullPage: false });

    // DOM
    const domHtml = await capturePanelDom(page);
    if (domHtml) saveHtml(spDomPath, domHtml);

    // Accessibility
    try {
      const a11y = await page.locator('body').ariaSnapshot({ timeout: 4000 });
      if (a11y) saveText(spA11yPath, a11y);
    } catch { /* non-critical */ }

    // Content
    const content = await extractPanelContent(page);
    console.log(`  [SIDE PANEL] Sections: ${content.sections.slice(0, 4).join(', ')}`);
    console.log(`  [SIDE PANEL] Tabs: ${content.tabs.join(', ')}`);
    console.log(`  [SIDE PANEL] Buttons: ${content.buttons.slice(0, 5).join(', ')}`);

    const locators: LocatorSuggestion[] = [
      {
        element: 'Side panel container',
        locator: `page.locator('[class*="side-panel"], [class*="drawer"], [role="complementary"]').first()`,
        strategy: 'css-role',
        stability: 'MODERATE',
        notes: 'Check actual class name in app DevTools',
      },
    ];

    // Close: navigate back to reset state
    await page.goto(pageUrl, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);

    return {
      pageId,
      triggeredBy: context,
      sections: content.sections,
      fields: content.fields,
      buttons: content.buttons,
      tabs: content.tabs,
      closeMethod: 'Navigate back to page URL',
      screenshotPath: spScreenshot,
      domPath: spDomPath,
      locators,
    };

  } catch (err) {
    console.log(`  [SIDE PANEL ERROR] Inspect: ${err}`);
    await page.goto(pageUrl, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
    return null;
  }
}
