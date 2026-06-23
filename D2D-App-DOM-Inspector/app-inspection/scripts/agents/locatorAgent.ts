import { ElementInfo } from '../../helpers/dom-capture';
import { LocatorSuggestion } from '../../helpers/reporter';

export function generateLocatorForElement(el: ElementInfo): LocatorSuggestion | null {
  const tag = el.tag || 'element';
  const roleMap: Record<string, string> = {
    button: 'button', a: 'link', input: 'textbox',
    select: 'combobox', checkbox: 'checkbox', radio: 'radio',
  };
  const role = el.role || roleMap[tag] || tag;

  // Priority 1: getByRole + aria-label (most stable)
  if (el.ariaLabel && el.ariaLabel.length > 0) {
    return {
      element: `${tag}: aria-label="${el.ariaLabel}"`,
      locator: `page.getByRole('${role}', { name: '${escapeStr(el.ariaLabel)}' })`,
      strategy: 'getByRole+ariaLabel',
      stability: 'STABLE',
      notes: 'ARIA label survives CSS and DOM structural changes',
    };
  }

  // Priority 2: getByTestId (most stable when maintained)
  if (el.dataTestId) {
    return {
      element: `${tag}: data-testid="${el.dataTestId}"`,
      locator: `page.getByTestId('${el.dataTestId}')`,
      strategy: 'getByTestId',
      stability: 'STABLE',
      notes: 'data-testid is the most stable locator if developers maintain it',
    };
  }

  // Priority 3: getByLabel (for form inputs)
  if (el.tag === 'input' || el.tag === 'textarea' || el.tag === 'select') {
    if (el.ariaLabel) {
      return {
        element: `${tag}: label="${el.ariaLabel}"`,
        locator: `page.getByLabel('${escapeStr(el.ariaLabel)}')`,
        strategy: 'getByLabel',
        stability: 'STABLE',
        notes: 'Associated label text — stable if label does not change',
      };
    }
  }

  // Priority 4: getByPlaceholder
  if (el.placeholder && el.placeholder.length > 0) {
    return {
      element: `${tag}: placeholder="${el.placeholder}"`,
      locator: `page.getByPlaceholder('${escapeStr(el.placeholder)}')`,
      strategy: 'getByPlaceholder',
      stability: 'MODERATE',
      notes: 'Placeholder text — may change with i18n or UX updates',
    };
  }

  // Priority 5: getByRole + text (moderate)
  if (el.text && el.text.length > 0 && el.text.length < 60) {
    return {
      element: `${tag}: text="${el.text}"`,
      locator: `page.getByRole('${role}', { name: '${escapeStr(el.text)}' })`,
      strategy: 'getByRole+text',
      stability: 'MODERATE',
      notes: 'Uses visible text — stable unless text is translated or changed',
    };
  }

  // Priority 6: CSS ID (check if static)
  if (el.id) {
    const isLikelyDynamic = /^\d+$/.test(el.id) || el.id.includes('ng-') || el.id.includes('mat-');
    return {
      element: `${tag}: id="${el.id}"`,
      locator: `page.locator('#${el.id}')`,
      strategy: 'css-id',
      stability: isLikelyDynamic ? 'BRITTLE' : 'MODERATE',
      notes: isLikelyDynamic
        ? 'ID appears to be dynamically generated — prefer role/label locator'
        : 'Static ID — stable but verify it does not change between page loads',
    };
  }

  return null;
}

export function generateLocators(elements: ElementInfo[], context: string): LocatorSuggestion[] {
  const results: LocatorSuggestion[] = [];
  const seen = new Set<string>();

  for (const el of elements.slice(0, 30)) {
    try {
      const suggestion = generateLocatorForElement(el);
      if (!suggestion) continue;
      if (seen.has(suggestion.locator)) continue;
      seen.add(suggestion.locator);
      results.push(suggestion);
    } catch { /* skip broken elements */ }
  }

  return results;
}

export function locatorForButton(text: string, ariaLabel?: string | null, dataTestId?: string | null): string {
  if (dataTestId) return `page.getByTestId('${dataTestId}')`;
  if (ariaLabel) return `page.getByRole('button', { name: '${escapeStr(ariaLabel)}' })`;
  if (text) return `page.getByRole('button', { name: '${escapeStr(text)}' })`;
  return `page.locator('button')`;
}

export function locatorForInput(placeholder?: string | null, ariaLabel?: string | null, id?: string | null): string {
  if (ariaLabel) return `page.getByLabel('${escapeStr(ariaLabel)}')`;
  if (placeholder) return `page.getByPlaceholder('${escapeStr(placeholder)}')`;
  if (id) return `page.locator('#${id}')`;
  return `page.locator('input')`;
}

export function locatorForModal(): string {
  return `page.getByRole('dialog')`;
}

export function locatorForSidePanel(): string {
  return `page.locator('[class*="side-panel"], [class*="drawer"], [role="complementary"]').first()`;
}

function escapeStr(s: string): string {
  return s.replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
}
