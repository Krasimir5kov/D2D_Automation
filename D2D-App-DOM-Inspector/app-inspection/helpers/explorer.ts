import { Page } from '@playwright/test';
import * as path from 'path';
import {
  ensureDir,
  saveJson,
  saveHtml,
  saveText,
  outputPath,
  sanitizeFilename,
  humanTimestamp,
} from './filesystem';
import { classifyButton } from './safe-actions';
import { cleanHtml } from './dom-capture';

// ============================================================
// Types
// ============================================================

export type UIChangeType =
  | 'modal'
  | 'side-panel'
  | 'dropdown'
  | 'navigation'
  | 'expansion'
  | 'content-change'
  | 'none'
  | 'error';

export interface ClickTarget {
  index: number;
  tag: string;
  text: string;
  ariaLabel: string | null;
  role: string | null;
  dataTestId: string | null;
  classes: string;
  href: string | null;
  type: string | null;
  cx: number;  // click x center
  cy: number;  // click y center
  width: number;
  height: number;
  safetyClass: string;
}

export interface ClickDiscovery {
  element: ClickTarget;
  clicked: boolean;
  skipReason?: string;
  uiChangeType: UIChangeType;
  preScreenshot: string;
  postScreenshot: string;
  domSnapshotPath: string;
  a11ySnapshotPath: string;
  urlBefore: string;
  urlAfter: string;
  newHeadings: string[];
  modalSections?: string[];
  modalFields?: string[];
  modalButtons?: string[];
  error?: string;
  timestamp: string;
}

export interface ExplorationSummary {
  pageId: string;
  pageUrl: string;
  timestamp: string;
  totalFound: number;
  clicked: number;
  skipped: number;
  errors: number;
  byChangeType: Record<string, number>;
  elements: Array<{
    index: number;
    text: string;
    tag: string;
    safetyClass: string;
    clicked: boolean;
    skipReason?: string;
    uiChangeType: UIChangeType;
    urlAfter: string;
    error?: string;
  }>;
}

// ============================================================
// Destroy guard — the ONLY things we never click
// ============================================================
const HARD_SKIP_PATTERN = /\b(löschen|delete|remove\b|drop|destroy|vernichten)\b/i;

function shouldSkip(text: string, ariaLabel: string | null): boolean {
  return HARD_SKIP_PATTERN.test(`${text} ${ariaLabel || ''}`);
}

// ============================================================
// Find all interactive elements visible in current viewport
// ============================================================
export async function findInteractiveElements(page: Page): Promise<ClickTarget[]> {
  const raw = await page.evaluate(() => {
    const selectors = [
      'button:not([disabled])',
      '[role="button"]',
      '[role="tab"]',
      '[role="menuitem"]',
      '[role="option"]',
      'a[href]',
      'select',
      'input[type="checkbox"]',
      'input[type="radio"]',
      '[class*="accordion"] > *',
      '[class*="collapse-header"]',
      '[class*="expand-header"]',
      '[class*="filter"]',
      '[class*="dropdown-toggle"]',
      '[class*="menu-item"]',
      '[class*="nav-item"] > a',
      '[class*="nav-link"]',
      '[class*="sidebar"] a',
      '[class*="sidebar"] [role="button"]',
      '[class*="list-item"]',
      '[class*="listitem"]',
      'mat-list-item',
      'mat-chip',
      'mat-expansion-panel-header',
      '[class*="chip"]',
      '[class*="overflow-menu"]',
      '[class*="more-btn"]',
      '[aria-haspopup]',
      '[data-toggle]',
    ];

    const seen = new Set<string>();
    const result: any[] = [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    for (const sel of selectors) {
      let els: Element[];
      try {
        els = Array.from(document.querySelectorAll(sel));
      } catch {
        continue;
      }

      for (const el of els) {
        if ((el as HTMLInputElement).disabled) continue;
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (rect.width <= 2 || rect.height <= 2) continue;

        const cx = rect.x + rect.width / 2;
        const cy = rect.y + rect.height / 2;

        // Must be inside visible viewport
        if (cx < 0 || cy < 0 || cx > vw || cy > vh) continue;

        // Deduplicate by rounded click center
        const key = `${Math.round(cx / 4) * 4},${Math.round(cy / 4) * 4}`;
        if (seen.has(key)) continue;
        seen.add(key);

        result.push({
          tag: el.tagName.toLowerCase(),
          text: ((el as HTMLElement).innerText || '').trim().replace(/\s+/g, ' ').slice(0, 120),
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          dataTestId: el.getAttribute('data-testid') || el.getAttribute('data-test-id'),
          classes: (el.className || '').toString().slice(0, 200),
          href: el.getAttribute('href'),
          type: el.getAttribute('type'),
          cx: Math.round(cx),
          cy: Math.round(cy),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    }

    // Cap at 80 elements to avoid infinite runs
    return result.slice(0, 80);
  });

  return raw.map((el: any, index: number) => ({
    ...el,
    index,
    safetyClass: classifyButton(el.text, el.ariaLabel),
  }));
}

// ============================================================
// Detect what changed in the UI after a click
// ============================================================
async function detectUIChange(
  page: Page,
  urlBefore: string
): Promise<{ type: UIChangeType; urlAfter: string }> {
  const urlAfter = page.url();
  if (urlAfter !== urlBefore) return { type: 'navigation', urlAfter };

  const result = await page.evaluate(() => {
    const isVisible = (el: Element | null) => {
      if (!el) return false;
      const r = (el as HTMLElement).getBoundingClientRect();
      return r.width > 80 && r.height > 40;
    };

    const modal = document.querySelector(
      '[role="dialog"], mat-dialog-container, .cdk-overlay-pane .mat-dialog-container'
    );
    if (isVisible(modal)) return 'modal';

    const panel = document.querySelector(
      '[class*="side-panel"], [class*="sidepanel"], [class*="drawer"], [role="complementary"]'
    );
    if (isVisible(panel)) return 'side-panel';

    const dropdown = document.querySelector(
      '[role="listbox"], [role="menu"], [class*="dropdown-menu"], mat-option, [class*="autocomplete-panel"]'
    );
    if (dropdown) {
      const r = (dropdown as HTMLElement).getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return 'dropdown';
    }

    return 'content-change';
  }).catch(() => 'none' as UIChangeType);

  return { type: result as UIChangeType, urlAfter };
}

// ============================================================
// Capture the most relevant DOM after a click
// ============================================================
async function captureRelevantDom(page: Page): Promise<string> {
  const html = await page.evaluate(() => {
    const pick = (sel: string) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = (el as HTMLElement).getBoundingClientRect();
      return r.width > 80 && r.height > 40 ? (el as HTMLElement).outerHTML : null;
    };

    return (
      pick('[role="dialog"]') ||
      pick('mat-dialog-container') ||
      pick('.cdk-overlay-pane') ||
      pick('[class*="side-panel"]') ||
      pick('[class*="drawer"]') ||
      pick('[role="listbox"]') ||
      pick('[role="menu"]') ||
      pick('main') ||
      pick('[role="main"]') ||
      document.body.outerHTML
    );
  });
  return cleanHtml(html);
}

// ============================================================
// Extract what is inside an open modal
// ============================================================
async function extractModalContent(page: Page): Promise<{
  sections: string[];
  fields: string[];
  buttons: string[];
}> {
  return page.evaluate(() => {
    const modal =
      document.querySelector('[role="dialog"]') ||
      document.querySelector('mat-dialog-container') ||
      document.querySelector('[class*="modal"]');

    if (!modal) return { sections: [], fields: [], buttons: [] };

    const sections = Array.from(
      modal.querySelectorAll('h1,h2,h3,h4,h5,[class*="title"],[class*="heading"],[class*="section-name"]')
    )
      .map((e) => (e as HTMLElement).innerText?.trim() || '')
      .filter(Boolean)
      .slice(0, 20);

    const fields = Array.from(
      modal.querySelectorAll('label, input, select, textarea, [role="combobox"], [placeholder]')
    )
      .map((e) => {
        const inp = e as HTMLInputElement;
        return inp.placeholder || e.getAttribute('aria-label') || (e as HTMLElement).innerText?.trim() || '';
      })
      .filter(Boolean)
      .slice(0, 40);

    const buttons = Array.from(modal.querySelectorAll('button, [role="button"], a[class*="btn"]'))
      .filter((e) => {
        const r = (e as HTMLElement).getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      })
      .map((e) => (e as HTMLElement).innerText?.trim() || e.getAttribute('aria-label') || '')
      .filter(Boolean)
      .slice(0, 15);

    return { sections, fields, buttons };
  });
}

// ============================================================
// Reset UI state: close modal/dropdown, navigate back if needed
// ============================================================
async function resetUIState(page: Page, originalUrl: string): Promise<void> {
  try {
    // Close modal if open
    const modalOpen = await page.evaluate(() => {
      const d =
        document.querySelector('[role="dialog"]') ||
        document.querySelector('mat-dialog-container');
      if (!d) return false;
      const r = (d as HTMLElement).getBoundingClientRect();
      return r.width > 80;
    }).catch(() => false);

    if (modalOpen) {
      // Try clicking X button in modal header first
      const closed = await page.evaluate(() => {
        const dialog =
          document.querySelector('[role="dialog"]') ||
          document.querySelector('mat-dialog-container');
        if (!dialog) return false;
        const btns = Array.from(dialog.querySelectorAll('button'));
        for (const btn of btns) {
          const t = (btn.innerText || '').trim();
          const a = btn.getAttribute('aria-label') || '';
          if (
            t === '×' || t === '✕' || t === 'X' ||
            a.toLowerCase().includes('close') ||
            a.toLowerCase().includes('schließ') ||
            btn.className.toLowerCase().includes('close')
          ) {
            const r = btn.getBoundingClientRect();
            if (r.width > 0) { btn.click(); return true; }
          }
        }
        return false;
      }).catch(() => false);

      if (!closed) {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(600);
    }

    // Close dropdown if open
    const dropdownOpen = await page.evaluate(() => {
      const d = document.querySelector(
        '[role="listbox"], [role="menu"], [class*="dropdown-menu"], [class*="autocomplete-panel"]'
      );
      if (!d) return false;
      const r = (d as HTMLElement).getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }).catch(() => false);

    if (dropdownOpen) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    // Navigate back if URL changed
    if (page.url() !== originalUrl) {
      await page.goto(originalUrl, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1200);
    }
  } catch {
    // Best-effort reset — always continue
  }
}

// ============================================================
// Main exploration runner — called once per page
// ============================================================
export async function runPageExploration(
  page: Page,
  pageId: string,
  pageUrl: string
): Promise<ExplorationSummary> {
  const explorationDir = path.join(
    process.env.OUTPUT_DIR || 'output',
    'explorations',
    pageId
  );
  ensureDir(explorationDir);

  console.log(`\n  [EXPLORE] ═══ Starting full UI exploration: ${pageId} ═══`);
  console.log(`  [EXPLORE] URL: ${pageUrl}`);

  const elements = await findInteractiveElements(page);
  console.log(`  [EXPLORE] Found ${elements.length} interactive elements in viewport`);

  const discoveries: ClickDiscovery[] = [];

  for (const el of elements) {
    const label = (el.text || el.ariaLabel || el.role || el.tag).slice(0, 60);
    const dirName = `${String(el.index).padStart(3, '0')}-${sanitizeFilename(label)}`;
    const elDir = path.join(explorationDir, dirName);
    ensureDir(elDir);

    const discovery: ClickDiscovery = {
      element: el,
      clicked: false,
      uiChangeType: 'none',
      preScreenshot: '',
      postScreenshot: '',
      domSnapshotPath: '',
      a11ySnapshotPath: '',
      urlBefore: page.url(),
      urlAfter: page.url(),
      newHeadings: [],
      timestamp: humanTimestamp(),
    };

    // Hard skip: only genuinely destructive (delete/löschen)
    if (shouldSkip(el.text, el.ariaLabel)) {
      discovery.skipReason = 'DESTRUCTIVE — permanently skipped';
      console.log(`  [SKIP ☠] "${label}"`);
      discoveries.push(discovery);
      continue;
    }

    try {
      const urlBefore = page.url();
      console.log(`  [→ CLICK] #${el.index} "${label}" (${el.tag}/${el.safetyClass}) at (${el.cx}, ${el.cy})`);

      // Screenshot before click
      const preScreenshotPath = path.join(elDir, 'before.png');
      await page.screenshot({ path: preScreenshotPath, fullPage: false });
      discovery.preScreenshot = preScreenshotPath;

      // Click using mouse at element center
      await page.mouse.click(el.cx, el.cy);
      discovery.clicked = true;

      // Wait for DOM to settle — fixed timeout, never networkidle
      await page.waitForTimeout(1400);

      // Detect what changed
      const uiChange = await detectUIChange(page, urlBefore);
      discovery.uiChangeType = uiChange.type;
      discovery.urlAfter = uiChange.urlAfter;

      // Screenshot after click
      const postScreenshotPath = path.join(elDir, 'after.png');
      await page.screenshot({ path: postScreenshotPath, fullPage: false });
      discovery.postScreenshot = postScreenshotPath;

      // Capture relevant DOM (modal/panel/dropdown/page content)
      const domHtml = await captureRelevantDom(page);
      const domFilePath = path.join(elDir, 'dom-after.html');
      saveHtml(domFilePath, domHtml);
      discovery.domSnapshotPath = domFilePath;

      // Accessibility snapshot
      try {
        const a11y = await page.locator('body').ariaSnapshot({ timeout: 4000 });
        if (a11y) {
          const a11yPath = path.join(elDir, 'a11y-after.txt');
          saveText(a11yPath, a11y);
          discovery.a11ySnapshotPath = a11yPath;
        }
      } catch { /* non-critical */ }

      // If modal opened, extract its full content
      if (uiChange.type === 'modal') {
        const content = await extractModalContent(page);
        discovery.modalSections = content.sections;
        discovery.modalFields = content.fields;
        discovery.modalButtons = content.buttons;
        console.log(`     ↳ Modal: sections=[${content.sections.slice(0, 3).join(', ')}] buttons=[${content.buttons.join(', ')}]`);
      }

      // Capture visible headings as summary of new content
      discovery.newHeadings = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll('h1,h2,h3,h4,[class*="title"],[class*="heading"],[class*="modal-title"]')
        )
          .filter((e) => {
            const r = (e as HTMLElement).getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          })
          .map((e) => (e as HTMLElement).innerText?.trim() || '')
          .filter(Boolean)
          .slice(0, 10);
      }).catch(() => []);

      // Save discovery record
      saveJson(path.join(elDir, 'discovery.json'), discovery);

      const changeDesc =
        uiChange.type === 'navigation'
          ? `→ navigated to ${uiChange.urlAfter}`
          : uiChange.type === 'none'
          ? '(no visible change)'
          : `↓ ${uiChange.type}`;
      console.log(`     ↳ ${changeDesc}`);

      // Reset before next element
      await resetUIState(page, pageUrl);
      await page.waitForTimeout(500);

    } catch (err) {
      discovery.error = String(err);
      console.log(`  [ERROR] "${label}": ${err}`);
      // Always try to reset after error
      await resetUIState(page, pageUrl).catch(() => {});
      await page.waitForTimeout(800);
    }

    discoveries.push(discovery);
  }

  // Build summary
  const byChangeType: Record<string, number> = {};
  for (const d of discoveries) {
    byChangeType[d.uiChangeType] = (byChangeType[d.uiChangeType] || 0) + 1;
  }

  const summary: ExplorationSummary = {
    pageId,
    pageUrl,
    timestamp: humanTimestamp(),
    totalFound: elements.length,
    clicked: discoveries.filter((d) => d.clicked).length,
    skipped: discoveries.filter((d) => d.skipReason != null).length,
    errors: discoveries.filter((d) => d.error != null).length,
    byChangeType,
    elements: discoveries.map((d) => ({
      index: d.element.index,
      text: d.element.text,
      tag: d.element.tag,
      safetyClass: d.element.safetyClass,
      clicked: d.clicked,
      skipReason: d.skipReason,
      uiChangeType: d.uiChangeType,
      urlAfter: d.urlAfter,
      error: d.error,
    })),
  };

  // Save summaries
  saveJson(path.join(explorationDir, 'exploration-map.json'), summary);
  saveJson(outputPath('data', `exploration-${pageId}.json`), summary);

  console.log(`\n  [EXPLORE] ═══ Done: ${summary.clicked} clicked`);
  console.log(`            modals=${byChangeType['modal'] || 0}  side-panels=${byChangeType['side-panel'] || 0}  dropdowns=${byChangeType['dropdown'] || 0}  navigations=${byChangeType['navigation'] || 0}  content-changes=${byChangeType['content-change'] || 0}  no-change=${byChangeType['none'] || 0}  errors=${summary.errors}`);

  return summary;
}
