import { Page } from '@playwright/test';
import { SAFE_NAVIGATION_PATHS } from '../../helpers/page-map';
import { safeNavigate } from '../../helpers/safe-actions';

export interface NavigationResult {
  reached: boolean;
  method: 'direct_url' | 'ui_click' | 'failed';
  finalUrl: string;
  triedPaths: string[];
  risks: string[];
}

const PAGE_NAV_TEXTS: Record<string, string[]> = {
  baulose: ['Baulose', 'Baulos'],
  objekte: ['Objekte'],
  'sales-action': ['Sales Action', 'Sales'],
  benutzerverwaltung: ['Benutzerverwaltung', 'Benutzer', 'User Management'],
  importe: ['Importe', 'Import'],
  konfiguration: ['Konfiguration', 'Einstellungen', 'Configuration', 'Settings'],
};

export async function navigateToPage(
  page: Page,
  pageId: string,
  baseUrl: string
): Promise<NavigationResult> {
  // Extract the hash root — everything before the '#'.
  // BASE_URL = "https://host/door2door#/objekte/neubau"
  //   → hashRoot = "https://host/door2door"
  //   → plainRoot = same (no trailing slash)
  const hashRoot = baseUrl.includes('#')
    ? baseUrl.split('#')[0].replace(/\/$/, '')
    : baseUrl.replace(/\/$/, '').replace(/#.*$/, '');

  const paths = SAFE_NAVIGATION_PATHS[pageId] || [];
  const triedPaths: string[] = [];
  const risks: string[] = [];

  // Strategy 1: hash-based SPA URL — "https://host/door2door#/baulose"
  // Try this FIRST because the app uses Angular hash routing.
  for (const p of paths) {
    const url = `${hashRoot}#${p}`;   // e.g. …/door2door#/baulose
    triedPaths.push(url);
    const ok = await safeNavigate(page, url);
    if (ok) {
      await page.waitForTimeout(1500);
      console.log(`  [NAV] Reached ${pageId} via hash URL: ${url}`);
      return { reached: true, method: 'direct_url', finalUrl: page.url(), triedPaths, risks };
    }
  }

  // Strategy 2: plain URL fallback (non-hash servers)
  for (const p of paths) {
    const url = `${hashRoot}${p}`;    // e.g. …/door2door/baulose
    triedPaths.push(url);
    const ok = await safeNavigate(page, url);
    if (ok) {
      await page.waitForTimeout(1500);
      console.log(`  [NAV] Reached ${pageId} via direct URL: ${url}`);
      return { reached: true, method: 'direct_url', finalUrl: page.url(), triedPaths, risks };
    }
  }

  console.log(`  [NAV] Direct URL failed for ${pageId} — trying UI navigation`);

  // Strategy 3: click navigation links in the UI
  const navTexts = PAGE_NAV_TEXTS[pageId] || [];
  for (const text of navTexts) {
    try {
      const link = page.getByRole('link', { name: text }).first();
      if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
        await link.click({ timeout: 3000 });
        await page.waitForTimeout(1500);
        console.log(`  [NAV] Reached ${pageId} via UI link: "${text}"`);
        return { reached: true, method: 'ui_click', finalUrl: page.url(), triedPaths, risks };
      }
    } catch { /* try next */ }

    try {
      const btn = page.getByRole('button', { name: text }).first();
      if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await btn.click({ timeout: 3000 });
        await page.waitForTimeout(1500);
        console.log(`  [NAV] Reached ${pageId} via UI button: "${text}"`);
        return { reached: true, method: 'ui_click', finalUrl: page.url(), triedPaths, risks };
      }
    } catch { /* try next */ }

    // Try clicking any visible nav element with matching text
    try {
      const navEl = page.locator(`nav a, [class*="nav"] a, [class*="menu"] a, aside a`).filter({ hasText: text }).first();
      if (await navEl.isVisible({ timeout: 1000 }).catch(() => false)) {
        await navEl.click({ timeout: 3000 });
        await page.waitForTimeout(1500);
        console.log(`  [NAV] Reached ${pageId} via nav element: "${text}"`);
        return { reached: true, method: 'ui_click', finalUrl: page.url(), triedPaths, risks };
      }
    } catch { /* try next */ }
  }

  risks.push(`Could not navigate to ${pageId} — tried: ${triedPaths.join(', ')}`);
  console.log(`  [NAV] Failed to reach ${pageId}`);
  return { reached: false, method: 'failed', finalUrl: page.url(), triedPaths, risks };
}

export function getPagePaths(pageId: string): string[] {
  return SAFE_NAVIGATION_PATHS[pageId] || [];
}

export async function getCurrentPageId(page: Page): Promise<string | null> {
  const url = page.url();
  const pageIds = Object.keys(SAFE_NAVIGATION_PATHS);
  for (const id of pageIds) {
    const paths = SAFE_NAVIGATION_PATHS[id] || [];
    if (paths.some((p) => url.toLowerCase().includes(p.replace('/', '')))) {
      return id;
    }
  }
  return null;
}
