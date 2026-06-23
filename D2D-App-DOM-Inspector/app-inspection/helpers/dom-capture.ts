import { Page, Locator } from '@playwright/test';
import { saveHtml, saveText } from './filesystem';

export interface DomCaptureResult {
  html: string;
  cleaned: string;
}

export async function captureFullPageDom(page: Page): Promise<string> {
  return page.evaluate(() => document.documentElement.outerHTML);
}

export async function captureElementDom(locator: Locator): Promise<string> {
  return locator.evaluate((el) => el.outerHTML);
}

export async function captureMainContentDom(page: Page): Promise<string> {
  return page.evaluate(() => {
    const selectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '#main-content',
      '.app-content',
      '.page-content',
      '#content',
      '.content',
      'body',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el.outerHTML;
    }
    return document.body.outerHTML;
  });
}

export function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function captureAccessibilitySnapshot(page: Page): Promise<string> {
  try {
    const snapshot = await page.locator('body').ariaSnapshot({ timeout: 8000 });
    return snapshot || 'No accessibility snapshot available';
  } catch {
    return 'Accessibility snapshot failed';
  }
}

export async function captureAndSaveDom(
  page: Page,
  name: string,
  domFilePath: string,
  a11yFilePath: string,
  useMain = true
): Promise<{ domHtml: string; a11ySnapshot: string }> {
  const rawHtml = useMain
    ? await captureMainContentDom(page)
    : await captureFullPageDom(page);

  const cleaned = cleanHtml(rawHtml);
  saveHtml(domFilePath, cleaned);

  const a11y = await captureAccessibilitySnapshot(page);
  saveText(a11yFilePath, a11y);

  return { domHtml: cleaned, a11ySnapshot: a11y };
}

export interface ElementInfo {
  tag: string;
  text: string;
  role: string | null;
  id: string | null;
  name: string | null;
  placeholder: string | null;
  ariaLabel: string | null;
  dataTestId: string | null;
  href: string | null;
  type: string | null;
  classes: string;
  isVisible: boolean;
}

export async function collectButtons(page: Page): Promise<ElementInfo[]> {
  return page.evaluate(() => {
    const buttons = Array.from(
      document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]')
    );
    return buttons
      .filter((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .slice(0, 100)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el as HTMLElement).innerText?.trim() || el.getAttribute('value') || '',
        role: el.getAttribute('role'),
        id: el.getAttribute('id'),
        name: el.getAttribute('name'),
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid') || el.getAttribute('data-test-id'),
        href: null,
        type: el.getAttribute('type'),
        classes: el.className || '',
        isVisible: true,
      }));
  });
}

export async function collectLinks(page: Page): Promise<ElementInfo[]> {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    return links
      .filter((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .slice(0, 100)
      .map((el) => ({
        tag: 'a',
        text: (el as HTMLElement).innerText?.trim() || '',
        role: el.getAttribute('role'),
        id: el.getAttribute('id'),
        name: el.getAttribute('name'),
        placeholder: null,
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid') || el.getAttribute('data-test-id'),
        href: el.getAttribute('href'),
        type: null,
        classes: el.className || '',
        isVisible: true,
      }));
  });
}

export async function collectInputs(page: Page): Promise<ElementInfo[]> {
  return page.evaluate(() => {
    const inputs = Array.from(
      document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea')
    );
    return inputs
      .filter((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .slice(0, 100)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el as HTMLInputElement).value || '',
        role: el.getAttribute('role'),
        id: el.getAttribute('id'),
        name: el.getAttribute('name'),
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid') || el.getAttribute('data-test-id'),
        href: null,
        type: el.getAttribute('type'),
        classes: el.className || '',
        isVisible: true,
      }));
  });
}

export async function collectSelects(page: Page): Promise<ElementInfo[]> {
  return page.evaluate(() => {
    const selects = Array.from(
      document.querySelectorAll('select, [role="combobox"], [role="listbox"], [role="select"]')
    );
    return selects
      .filter((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .slice(0, 50)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el as HTMLElement).innerText?.trim() || '',
        role: el.getAttribute('role'),
        id: el.getAttribute('id'),
        name: el.getAttribute('name'),
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid') || el.getAttribute('data-test-id'),
        href: null,
        type: null,
        classes: el.className || '',
        isVisible: true,
      }));
  });
}

export async function collectCheckboxes(page: Page): Promise<ElementInfo[]> {
  return page.evaluate(() => {
    const checkboxes = Array.from(
      document.querySelectorAll('input[type="checkbox"], [role="checkbox"]')
    );
    return checkboxes
      .filter((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .slice(0, 50)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el as HTMLElement).innerText?.trim() || el.getAttribute('aria-label') || '',
        role: el.getAttribute('role'),
        id: el.getAttribute('id'),
        name: el.getAttribute('name'),
        placeholder: null,
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid') || el.getAttribute('data-test-id'),
        href: null,
        type: 'checkbox',
        classes: el.className || '',
        isVisible: true,
      }));
  });
}

export async function collectTabs(page: Page): Promise<ElementInfo[]> {
  return page.evaluate(() => {
    const tabs = Array.from(
      document.querySelectorAll('[role="tab"], .tab, .nav-item, .nav-link')
    );
    return tabs
      .filter((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .slice(0, 50)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el as HTMLElement).innerText?.trim() || '',
        role: el.getAttribute('role'),
        id: el.getAttribute('id'),
        name: el.getAttribute('name'),
        placeholder: null,
        ariaLabel: el.getAttribute('aria-label'),
        dataTestId: el.getAttribute('data-testid') || el.getAttribute('data-test-id'),
        href: el.getAttribute('href'),
        type: null,
        classes: el.className || '',
        isVisible: true,
      }));
  });
}

export async function collectAllPageElements(page: Page) {
  const [buttons, links, inputs, selects, checkboxes, tabs] = await Promise.all([
    collectButtons(page),
    collectLinks(page),
    collectInputs(page),
    collectSelects(page),
    collectCheckboxes(page),
    collectTabs(page),
  ]);

  return { buttons, links, inputs, selects, checkboxes, tabs };
}
