import { Page } from '@playwright/test';
import { FilterInfo } from '../../helpers/reporter';

export async function discoverAndInspectFilters(
  page: Page,
  pageId: string
): Promise<FilterInfo[]> {
  const filters: FilterInfo[] = [];

  const filterElements = await page.evaluate(() => {
    const selectors = [
      '[class*="filter"]:not([class*="filter-result"]):not([class*="filtered"])',
      '[data-testid*="filter"]',
      '[aria-label*="Filter"]',
      '[aria-label*="filter"]',
      '[placeholder*="uche"]',    // "Suche" = search
      '[placeholder*="ilter"]',   // "Filter..."
      'select',
      '[role="combobox"]',
    ];

    const seen = new Set<string>();
    const result: Array<{
      text: string; ariaLabel: string | null; placeholder: string | null;
      id: string | null; className: string; tag: string; role: string | null;
    }> = [];

    for (const sel of selectors) {
      try {
        const els = Array.from(document.querySelectorAll(sel));
        for (const el of els) {
          const rect = (el as HTMLElement).getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) continue;
          const key = `${el.tagName}-${(el as HTMLElement).innerText?.trim().slice(0, 30)}`;
          if (seen.has(key)) continue;
          seen.add(key);
          result.push({
            text: ((el as HTMLElement).innerText || '').trim().slice(0, 80),
            ariaLabel: el.getAttribute('aria-label'),
            placeholder: el.getAttribute('placeholder'),
            id: el.getAttribute('id'),
            className: (el.className || '').toString().slice(0, 100),
            tag: el.tagName.toLowerCase(),
            role: el.getAttribute('role'),
          });
        }
      } catch { /* ignore */ }
    }
    return result.slice(0, 25);
  });

  for (const el of filterElements) {
    const name =
      el.ariaLabel || el.placeholder || el.text || el.id || 'Filter';

    if (!name || name.length < 2) continue;
    // Skip generic containers that matched by class but are not actual filter controls
    if (!el.ariaLabel && !el.placeholder && !el.id && el.tag === 'div') continue;

    const locator = el.ariaLabel
      ? `page.getByLabel('${el.ariaLabel}')`
      : el.placeholder
      ? `page.getByPlaceholder('${el.placeholder}')`
      : el.id
      ? `page.locator('#${el.id}')`
      : `page.locator('[class*="filter"]').nth(0)`;

    // Try to open the filter and capture options
    const options = await tryOpenAndCaptureOptions(page, el, name);

    const hasReset = await page.evaluate((n) => {
      const resetPatterns = ['reset', 'clear', 'löschen', 'zurücksetzen', 'entfernen', '×'];
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      return buttons.some((btn) => {
        const text = ((btn as HTMLElement).innerText || '').toLowerCase();
        return resetPatterns.some((p) => text.includes(p));
      });
    }, name).catch(() => false);

    filters.push({
      name: name.slice(0, 80),
      type: el.tag === 'select' ? 'select' : el.role === 'combobox' ? 'combobox' : 'custom',
      options,
      hasResetButton: hasReset,
      locator,
    });
  }

  return filters;
}

async function tryOpenAndCaptureOptions(
  page: Page,
  el: { text: string; ariaLabel: string | null; placeholder: string | null; id: string | null; tag: string },
  filterName: string
): Promise<string[]> {
  try {
    let filterLocator;
    if (el.ariaLabel) {
      filterLocator = page.getByLabel(el.ariaLabel).first();
    } else if (el.placeholder) {
      filterLocator = page.getByPlaceholder(el.placeholder).first();
    } else if (el.id) {
      filterLocator = page.locator(`#${el.id}`).first();
    } else {
      return [];
    }

    const isVisible = await filterLocator.isVisible({ timeout: 1500 }).catch(() => false);
    if (!isVisible) return [];

    await filterLocator.click({ timeout: 3000 });
    await page.waitForTimeout(700);

    const options = await page.evaluate(() => {
      const optEls = Array.from(
        document.querySelectorAll(
          '[role="option"], [role="menuitem"], .dropdown-item, .filter-option, mat-option, [class*="option"], [class*="item"]:not([class*="list-item"])'
        )
      );
      return optEls
        .filter((o) => {
          const r = (o as HTMLElement).getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        })
        .slice(0, 50)
        .map((o) => (o as HTMLElement).innerText?.trim() || '')
        .filter(Boolean);
    });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    return options;
  } catch {
    await page.keyboard.press('Escape').catch(() => {});
    return [];
  }
}
