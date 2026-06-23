import { Page, Locator } from '@playwright/test';

export type ButtonSafetyClass =
  | 'SAFE_NAVIGATION'
  | 'SAFE_OPEN'
  | 'SAFE_CLOSE'
  | 'SAFE_EXPAND'
  | 'SAFE_FILTER_VIEW'
  | 'RISKY_DATA_CHANGE'
  | 'DESTRUCTIVE'
  | 'UNKNOWN';

const DESTRUCTIVE_KEYWORDS = [
  'delete', 'remove', 'löschen', 'entfernen', 'drop', 'destroy',
];

const RISKY_KEYWORDS = [
  'save', 'submit', 'import', 'confirm', 'send', 'assign',
  'create', 'update', 'speichern', 'bestätigen', 'importieren',
  'anlegen', 'erstellen', 'aktualisieren', 'senden', 'zuweisen',
  'apply', 'anwenden',
];

const CLOSE_KEYWORDS = [
  'close', 'x', 'schließen', 'cancel', 'abbrechen', '✕', '×', 'dismiss',
];

const OPEN_KEYWORDS = [
  'filter', 'alle filter', 'open', 'öffnen', 'expand', 'details',
  'show', 'anzeigen', 'mehr', 'more',
];

const NAV_KEYWORDS = [
  'baulose', 'objekte', 'sales', 'benutzerverwaltung', 'importe', 'konfiguration',
  'dashboard', 'home', 'back', 'zurück',
];

export function classifyButton(text: string, ariaLabel?: string | null): ButtonSafetyClass {
  const combined = `${text} ${ariaLabel || ''}`.toLowerCase().trim();

  if (DESTRUCTIVE_KEYWORDS.some((k) => combined.includes(k))) return 'DESTRUCTIVE';
  if (RISKY_KEYWORDS.some((k) => combined.includes(k))) return 'RISKY_DATA_CHANGE';
  if (CLOSE_KEYWORDS.some((k) => combined === k || combined.includes(k))) return 'SAFE_CLOSE';
  if (NAV_KEYWORDS.some((k) => combined.includes(k))) return 'SAFE_NAVIGATION';
  if (OPEN_KEYWORDS.some((k) => combined.includes(k))) return 'SAFE_OPEN';
  if (combined.includes('tab') || combined.includes('reiter')) return 'SAFE_EXPAND';

  return 'UNKNOWN';
}

export const SAFE_CLASSES: ButtonSafetyClass[] = [
  'SAFE_NAVIGATION',
  'SAFE_OPEN',
  'SAFE_CLOSE',
  'SAFE_EXPAND',
  'SAFE_FILTER_VIEW',
];

export function isSafeToClick(safetyClass: ButtonSafetyClass): boolean {
  return SAFE_CLASSES.includes(safetyClass);
}

export async function safeClick(
  locator: Locator,
  description: string,
  safetyClass: ButtonSafetyClass
): Promise<boolean> {
  if (!isSafeToClick(safetyClass)) {
    console.log(`[SKIP] Not clicking "${description}" (${safetyClass})`);
    return false;
  }
  try {
    await locator.click({ timeout: 5000 });
    console.log(`[CLICK] Clicked "${description}" (${safetyClass})`);
    return true;
  } catch (err) {
    console.log(`[ERROR] Could not click "${description}": ${err}`);
    return false;
  }
}

export async function closeModalByX(page: Page): Promise<boolean> {
  // Strategy 1: find visible buttons inside the dialog and pick the one that looks like a close/X
  try {
    const dialogButtons = page.locator('[role="dialog"] button, mat-dialog-container button, .modal button');
    const count = await dialogButtons.count().catch(() => 0);
    for (let i = 0; i < Math.min(count, 10); i++) {
      try {
        const btn = dialogButtons.nth(i);
        if (!(await btn.isVisible({ timeout: 500 }).catch(() => false))) continue;
        const text = (await btn.innerText().catch(() => '')).trim();
        const ariaLabel = (await btn.getAttribute('aria-label').catch(() => '')) || '';
        const combined = `${text} ${ariaLabel}`.toLowerCase();
        if (
          text === '×' || text === '✕' || text === '✖' || text === 'x' || text === 'X' ||
          combined.includes('close') || combined.includes('schließ') || combined.includes('dismiss')
        ) {
          await btn.click({ timeout: 3000 });
          console.log(`[CLOSE] Closed modal via dialog button text="${text}"`);
          await page.waitForTimeout(800);
          return true;
        }
      } catch { /* try next */ }
    }
  } catch { /* fall through */ }

  // Strategy 2: CSS selectors list
  const xSelectors = [
    '[role="dialog"] button[class*="close"]',
    '[role="dialog"] button[class*="Close"]',
    '[role="dialog"] button[class*="dismiss"]',
    'mat-dialog-container button[class*="close"]',
    '[aria-label="Close"]',
    '[aria-label="close"]',
    '[aria-label="Schließen"]',
    'button[aria-label*="close" i]',
    'button[aria-label*="schließen" i]',
    '.modal-close',
    '.close-button',
    '[data-testid="close-button"]',
    '[data-testid="modal-close"]',
    'button.close',
  ];

  for (const sel of xSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 800 })) {
        await btn.click({ timeout: 3000 });
        console.log(`[CLOSE] Closed modal using selector: ${sel}`);
        await page.waitForTimeout(800);
        return true;
      }
    } catch {
      // try next selector
    }
  }

  // Strategy 3: press Escape
  try {
    await page.keyboard.press('Escape');
    console.log('[CLOSE] Closed modal using Escape key');
    await page.waitForTimeout(800);
    return true;
  } catch {
    return false;
  }
}

export async function waitForPageLoad(page: Page, timeout = 10000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    await page.waitForLoadState('load', { timeout: 5000 });
  }
}

export async function safeNavigate(page: Page, url: string): Promise<boolean> {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    return true;
  } catch {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 15000 });
      return true;
    } catch (err) {
      console.log(`[ERROR] Navigation to ${url} failed: ${err}`);
      return false;
    }
  }
}

export async function tryOpenFilterDropdown(
  page: Page,
  filterLocator: Locator,
  filterName: string
): Promise<string[]> {
  try {
    const isVisible = await filterLocator.isVisible({ timeout: 2000 });
    if (!isVisible) return [];

    await filterLocator.click({ timeout: 3000 });
    await page.waitForTimeout(800);

    const options = await page.evaluate(() => {
      const optionEls = Array.from(
        document.querySelectorAll(
          '[role="option"], [role="menuitem"], .dropdown-item, .filter-option, li[class*="option"], li[class*="item"]'
        )
      );
      return optionEls
        .filter((el) => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })
        .map((el) => (el as HTMLElement).innerText?.trim() || '')
        .filter(Boolean)
        .slice(0, 50);
    });

    console.log(`[FILTER] "${filterName}" options: ${options.join(', ')}`);

    // Close dropdown by pressing Escape or clicking outside
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    return options;
  } catch (err) {
    console.log(`[FILTER ERROR] Could not open filter "${filterName}": ${err}`);
    return [];
  }
}
