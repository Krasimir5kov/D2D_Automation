import { Page } from '@playwright/test';
import {
  screenshotPath,
  domPath,
  accessibilityPath,
  saveHtml,
  saveText,
} from '../../helpers/filesystem';
import { cleanHtml } from '../../helpers/dom-capture';
import { ModalInfo, LocatorSuggestion } from '../../helpers/reporter';
import { sanitizeFilename } from '../../helpers/filesystem';

const MODAL_SELECTORS = [
  '[role="dialog"]',
  'mat-dialog-container',
  '.cdk-overlay-container .cdk-overlay-pane',
  '.modal.show',
  '[class*="modal"][class*="open"]',
  '[class*="dialog"]',
];

export async function isModalOpen(page: Page): Promise<boolean> {
  for (const sel of MODAL_SELECTORS) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 600 })) return true;
    } catch { /* try next */ }
  }
  return false;
}

export async function closeModal(page: Page): Promise<void> {
  // Strategy 1: JS click on X button inside dialog
  try {
    const closed = await page.evaluate(() => {
      const dialog =
        document.querySelector('[role="dialog"]') ||
        document.querySelector('mat-dialog-container');
      if (!dialog) return false;
      const btns = Array.from(dialog.querySelectorAll('button'));
      for (const btn of btns) {
        const t = (btn.innerText || '').trim();
        const a = btn.getAttribute('aria-label') || '';
        const cls = (btn.className || '').toString().toLowerCase();
        if (
          t === '×' || t === '✕' || t === 'X' || t === 'x' ||
          a.toLowerCase().includes('close') ||
          a.toLowerCase().includes('schließ') ||
          cls.includes('close') || cls.includes('dismiss')
        ) {
          const r = btn.getBoundingClientRect();
          if (r.width > 0) { btn.click(); return true; }
        }
      }
      return false;
    });
    if (closed) {
      await page.waitForTimeout(900);
      return;
    }
  } catch { /* fall through */ }

  // Strategy 2: Playwright locators for X
  const closeSelectors = [
    '[role="dialog"] button:has-text("×")',
    '[role="dialog"] button:has-text("✕")',
    'mat-dialog-container button:has-text("×")',
    '[aria-label="Close"]',
    '[aria-label="close"]',
    '[aria-label*="schließ" i]',
    'button[class*="close"]',
    'button[class*="Close"]',
    'button[class*="dismiss"]',
  ];

  for (const sel of closeSelectors) {
    try {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 700 })) {
        await btn.click({ timeout: 2500 });
        await page.waitForTimeout(900);
        if (!(await isModalOpen(page))) return;
      }
    } catch { /* try next */ }
  }

  // Strategy 3: "Alle Filter entfernen" — safe only for the Alle Filter modal
  try {
    const clearBtn = page.getByText('Alle Filter entfernen', { exact: false }).first();
    if (await clearBtn.isVisible({ timeout: 800 }).catch(() => false)) {
      await clearBtn.click({ timeout: 2500 });
      await page.waitForTimeout(900);
      if (!(await isModalOpen(page))) return;
    }
  } catch { /* fall through */ }

  // Strategy 4: Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);

  // Final verify + second Escape if still open
  if (await isModalOpen(page)) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
  }
}

async function captureModalDom(page: Page): Promise<string> {
  const html = await page.evaluate(() => {
    const modal =
      document.querySelector('[role="dialog"]') ||
      document.querySelector('mat-dialog-container') ||
      document.querySelector('[class*="modal"]');
    return modal ? (modal as HTMLElement).outerHTML : '';
  });
  return cleanHtml(html);
}

async function extractModalContent(page: Page) {
  return page.evaluate(() => {
    const modal =
      document.querySelector('[role="dialog"]') ||
      document.querySelector('mat-dialog-container') ||
      document.querySelector('[class*="modal"]');
    if (!modal) return { sections: [], fields: [], filterOptions: [], buttons: [] };

    const sections = Array.from(
      modal.querySelectorAll('h1,h2,h3,h4,h5,[class*="title"],[class*="section-name"],[class*="filter-group"]')
    )
      .map((e) => (e as HTMLElement).innerText?.trim() || '')
      .filter(Boolean)
      .slice(0, 30);

    const filterOptions = Array.from(
      modal.querySelectorAll('mat-chip, [class*="chip"], [class*="badge"], [class*="filter-value"], [class*="option-label"]')
    )
      .filter((e) => { const r = (e as HTMLElement).getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((e) => (e as HTMLElement).innerText?.trim() || '')
      .filter(Boolean)
      .slice(0, 60);

    const fields = Array.from(
      modal.querySelectorAll('label, input, select, textarea, [role="combobox"], [placeholder]')
    )
      .map((e) => (e as HTMLInputElement).placeholder || e.getAttribute('aria-label') || (e as HTMLElement).innerText?.trim() || '')
      .filter(Boolean)
      .slice(0, 40);

    const buttons = Array.from(modal.querySelectorAll('button, [role="button"], a[class*="btn"]'))
      .filter((e) => { const r = (e as HTMLElement).getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((e) => (e as HTMLElement).innerText?.trim() || e.getAttribute('aria-label') || '')
      .filter(Boolean)
      .slice(0, 20);

    return { sections, fields, filterOptions, buttons };
  });
}

export async function inspectAlleFilterModal(
  page: Page,
  pageId: string
): Promise<ModalInfo | null> {
  const mName = `${pageId}-alle-filter-modal`;
  const mScreenshot = screenshotPath(mName);
  const mDomPath = domPath(mName);
  const mA11yPath = accessibilityPath(mName);

  try {
    // Find the trigger button
    let btn = page.getByText('alle Filter', { exact: false }).first();
    let visible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
    if (!visible) {
      btn = page.locator('button, [role="button"]').filter({ hasText: /alle.{0,3}filter/i }).first();
      visible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
    }
    if (!visible) {
      console.log('  [MODAL] "Alle Filter" button not found');
      return null;
    }

    await btn.click({ timeout: 5000 });
    await page.waitForTimeout(1500);

    if (!(await isModalOpen(page))) {
      console.log('  [MODAL] Modal did not open after "Alle Filter" click');
      return null;
    }

    console.log('  [MODAL] Alle Filter modal open — capturing');

    // Screenshot
    await page.screenshot({ path: mScreenshot, fullPage: false });

    // DOM
    const domHtml = await captureModalDom(page);
    saveHtml(mDomPath, domHtml);

    // Accessibility
    try {
      const a11y = await page.locator('[role="dialog"], mat-dialog-container, body').first().ariaSnapshot({ timeout: 5000 });
      if (a11y) saveText(mA11yPath, a11y);
    } catch { /* non-critical */ }

    // Content
    const content = await extractModalContent(page);
    console.log(`  [MODAL] Sections: ${content.sections.slice(0, 5).join(', ')}`);
    console.log(`  [MODAL] Buttons: ${content.buttons.join(', ')}`);

    const allFields = [
      ...content.sections,
      ...content.filterOptions,
      ...content.fields.filter((f) => !content.sections.includes(f)),
    ].filter(Boolean);

    const locators: LocatorSuggestion[] = [
      {
        element: 'Alle Filter trigger',
        locator: "page.getByText('alle Filter', { exact: false })",
        strategy: 'getByText',
        stability: 'MODERATE',
        notes: 'Uses visible button text',
      },
      {
        element: 'Alle Filter modal',
        locator: "page.getByRole('dialog')",
        strategy: 'getByRole',
        stability: 'STABLE',
        notes: 'role=dialog is stable for modal detection',
      },
      {
        element: 'Close X button',
        locator: "page.locator('[role=\"dialog\"] button').filter({ hasText: '×' })",
        strategy: 'locator+filter',
        stability: 'MODERATE',
        notes: '× button inside the dialog',
      },
    ];

    // Close the modal
    await closeModal(page);

    const stillOpen = await isModalOpen(page);
    if (stillOpen) {
      console.log('  [MODAL] WARNING: modal may still be open after close attempt');
    } else {
      console.log('  [MODAL] Alle Filter modal closed');
    }

    return {
      name: 'Alle Filter',
      triggeredBy: "page.getByText('alle Filter', { exact: false })",
      fields: allFields,
      buttons: content.buttons,
      closeMethod: 'Click × button or "Alle Filter entfernen" or Escape',
      screenshotPath: mScreenshot,
      domPath: mDomPath,
      locators,
    };

  } catch (err) {
    console.log(`  [MODAL ERROR] Alle Filter: ${err}`);
    await closeModal(page).catch(() => {});
    return null;
  }
}

export async function openAndInspectCreateModal(
  page: Page,
  pageId: string,
  triggerText: string
): Promise<ModalInfo | null> {
  const safeLabel = sanitizeFilename(triggerText);
  const mName = `${pageId}-create-modal-${safeLabel}`;
  const mScreenshot = screenshotPath(mName);
  const mDomPath = domPath(mName);

  try {
    const btnLocator = page.getByRole('button', { name: new RegExp(triggerText, 'i') }).first();
    const visible = await btnLocator.isVisible({ timeout: 2000 }).catch(() => false);
    if (!visible) return null;

    await btnLocator.click({ timeout: 4000 });
    await page.waitForTimeout(1200);

    if (!(await isModalOpen(page))) return null;

    console.log(`  [MODAL] Create modal open for "${triggerText}"`);

    await page.screenshot({ path: mScreenshot, fullPage: false });
    const domHtml = await captureModalDom(page);
    saveHtml(mDomPath, domHtml);

    const content = await extractModalContent(page);

    const locators: LocatorSuggestion[] = [
      {
        element: `${triggerText} create modal`,
        locator: "page.getByRole('dialog')",
        strategy: 'getByRole',
        stability: 'STABLE',
        notes: 'Targets the open dialog',
      },
    ];

    await closeModal(page);

    return {
      name: `Create: ${triggerText}`,
      triggeredBy: triggerText,
      fields: content.fields,
      buttons: content.buttons,
      closeMethod: 'Click × button or Escape',
      screenshotPath: mScreenshot,
      domPath: mDomPath,
      locators,
    };

  } catch (err) {
    console.log(`  [MODAL ERROR] Create modal "${triggerText}": ${err}`);
    await closeModal(page).catch(() => {});
    return null;
  }
}
