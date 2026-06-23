import { Page, Locator } from '@playwright/test';
import {
  classifyButton,
  ButtonSafetyClass,
  isSafeToClick,
  SAFE_CLASSES,
} from '../../helpers/safe-actions';

export { classifyButton, ButtonSafetyClass, isSafeToClick };

export interface SafeClickResult {
  clicked: boolean;
  safetyClass: ButtonSafetyClass;
  element: string;
  reason?: string;
}

export interface ElementContext {
  text: string;
  ariaLabel?: string | null;
  role?: string | null;
  title?: string | null;
  type?: string | null;
  classes?: string;
  nearbyLabel?: string;
}

export function classifyElementContext(ctx: ElementContext): ButtonSafetyClass {
  const combined = [ctx.text, ctx.ariaLabel, ctx.title, ctx.nearbyLabel]
    .filter(Boolean)
    .join(' ');
  return classifyButton(combined, ctx.ariaLabel);
}

export async function safeMouseClick(
  page: Page,
  cx: number,
  cy: number,
  ctx: ElementContext
): Promise<SafeClickResult> {
  const safetyClass = classifyElementContext(ctx);
  const label = ctx.text || ctx.ariaLabel || 'element';

  if (!isSafeToClick(safetyClass)) {
    console.log(`  [SAFETY ✗] Blocked: "${label}" → ${safetyClass}`);
    return { clicked: false, safetyClass, element: label, reason: `Blocked: ${safetyClass}` };
  }

  try {
    await page.mouse.click(cx, cy);
    console.log(`  [SAFETY ✓] Clicked: "${label}" → ${safetyClass}`);
    return { clicked: true, safetyClass, element: label };
  } catch (err) {
    const reason = String(err);
    console.log(`  [SAFETY ✗] Click failed: "${label}" — ${reason}`);
    return { clicked: false, safetyClass, element: label, reason };
  }
}

export async function safeLocatorClick(
  page: Page,
  locator: Locator,
  ctx: ElementContext
): Promise<SafeClickResult> {
  const safetyClass = classifyElementContext(ctx);
  const label = ctx.text || ctx.ariaLabel || 'element';

  if (!isSafeToClick(safetyClass)) {
    console.log(`  [SAFETY ✗] Blocked: "${label}" → ${safetyClass}`);
    return { clicked: false, safetyClass, element: label, reason: `Blocked: ${safetyClass}` };
  }

  try {
    await locator.click({ timeout: 5000 });
    console.log(`  [SAFETY ✓] Clicked: "${label}" → ${safetyClass}`);
    return { clicked: true, safetyClass, element: label };
  } catch (err) {
    const reason = String(err);
    console.log(`  [SAFETY ✗] Click failed: "${label}" — ${reason}`);
    return { clicked: false, safetyClass, element: label, reason };
  }
}

export async function classifyAndReportElement(
  page: Page,
  locator: Locator
): Promise<{ ctx: ElementContext; safetyClass: ButtonSafetyClass; allowed: boolean }> {
  const ctx: ElementContext = await locator.evaluate((el) => ({
    text: ((el as HTMLElement).innerText || '').trim().slice(0, 100),
    ariaLabel: el.getAttribute('aria-label'),
    role: el.getAttribute('role'),
    title: el.getAttribute('title'),
    type: el.getAttribute('type'),
    classes: el.className || '',
  })).catch(() => ({ text: '', ariaLabel: null, role: null, title: null, type: null, classes: '' }));

  const safetyClass = classifyElementContext(ctx);
  const allowed = isSafeToClick(safetyClass);
  return { ctx, safetyClass, allowed };
}

export function buildSafetyReport(
  elements: Array<{ text: string; ariaLabel?: string | null }>
): Array<{ text: string; safetyClass: ButtonSafetyClass; allowed: boolean }> {
  return elements.map((el) => {
    const safetyClass = classifyButton(el.text, el.ariaLabel);
    return { text: el.text, safetyClass, allowed: isSafeToClick(safetyClass) };
  });
}
