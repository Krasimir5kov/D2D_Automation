import { saveJson, saveText, outputPath, humanTimestamp } from './filesystem';
import { ElementInfo } from './dom-capture';
import { classifyButton } from './safe-actions';

export interface FilterInfo {
  name: string;
  type: string;
  options: string[];
  hasResetButton: boolean;
  locator: string;
}

export interface ListSectionInfo {
  name: string;
  itemCount: number;
  visibleItems: string[];
  buttons: string[];
}

export interface ModalInfo {
  name: string;
  triggeredBy: string;
  fields: string[];
  buttons: string[];
  closeMethod: string;
  screenshotPath: string;
  domPath: string;
  locators: LocatorSuggestion[];
}

export interface SidePanelInfo {
  pageId: string;
  triggeredBy: string;
  sections: string[];
  fields: string[];
  buttons: string[];
  tabs: string[];
  closeMethod: string;
  screenshotPath: string;
  domPath: string;
  locators: LocatorSuggestion[];
}

export interface LocatorSuggestion {
  element: string;
  locator: string;
  strategy: string;
  stability: 'STABLE' | 'MODERATE' | 'BRITTLE';
  notes: string;
}

export interface PageInspectionResult {
  pageId: string;
  pageName: string;
  url: string;
  timestamp: string;
  title: string;
  screenshotPath: string;
  domPath: string;
  a11yPath: string;
  buttons: ElementInfo[];
  links: ElementInfo[];
  inputs: ElementInfo[];
  selects: ElementInfo[];
  checkboxes: ElementInfo[];
  tabs: ElementInfo[];
  filters: FilterInfo[];
  listSections: ListSectionInfo[];
  modals: ModalInfo[];
  sidePanels: SidePanelInfo[];
  locators: LocatorSuggestion[];
  testSuggestions: string[];
  risks: string[];
  hasSidePanel: boolean;
  hasAlleFilterModal: boolean;
  hasCreateModal: boolean;
  sidebarItems?: string[];
  error?: string;
}

export function generateLocatorSuggestions(elements: ElementInfo[], context: string): LocatorSuggestion[] {
  const suggestions: LocatorSuggestion[] = [];

  for (const el of elements.slice(0, 20)) {
    if (el.ariaLabel) {
      suggestions.push({
        element: `${el.tag}: "${el.text || el.ariaLabel}"`,
        locator: `page.getByRole('${el.role || el.tag}', { name: '${el.ariaLabel}' })`,
        strategy: 'getByRole+ariaLabel',
        stability: 'STABLE',
        notes: 'Uses ARIA label — stable across visual changes',
      });
    } else if (el.text && el.text.length > 0 && el.text.length < 50) {
      suggestions.push({
        element: `${el.tag}: "${el.text}"`,
        locator: `page.getByRole('${el.role || el.tag}', { name: '${el.text}' })`,
        strategy: 'getByRole+text',
        stability: 'MODERATE',
        notes: 'Uses visible text — stable if text does not change',
      });
    } else if (el.dataTestId) {
      suggestions.push({
        element: `${el.tag}: data-testid="${el.dataTestId}"`,
        locator: `page.getByTestId('${el.dataTestId}')`,
        strategy: 'getByTestId',
        stability: 'STABLE',
        notes: 'Uses data-testid — most stable if maintained',
      });
    } else if (el.placeholder) {
      suggestions.push({
        element: `${el.tag}: placeholder="${el.placeholder}"`,
        locator: `page.getByPlaceholder('${el.placeholder}')`,
        strategy: 'getByPlaceholder',
        stability: 'MODERATE',
        notes: 'Uses placeholder — stable but may change with i18n',
      });
    } else if (el.id) {
      suggestions.push({
        element: `${el.tag}: id="${el.id}"`,
        locator: `page.locator('#${el.id}')`,
        strategy: 'css-id',
        stability: 'MODERATE',
        notes: 'Uses ID — check if ID is static or generated',
      });
    }
  }

  return suggestions;
}

export function generateTestSuggestions(result: Partial<PageInspectionResult>): string[] {
  const suggestions: string[] = [];
  const name = result.pageName || result.pageId || 'Page';

  suggestions.push(`test('${name} loads successfully', async ({ page }) => {`);
  suggestions.push(`  await expect(page).toHaveURL(/.*${result.pageId || ''}.*/);`);
  suggestions.push(`  // Verify main heading or page title is visible`);
  suggestions.push(`});`);
  suggestions.push('');

  if (result.filters && result.filters.length > 0) {
    suggestions.push(`test('${name} - filters are visible and interactive', async ({ page }) => {`);
    for (const filter of result.filters.slice(0, 3)) {
      suggestions.push(`  // Filter: ${filter.name}`);
      suggestions.push(`  await expect(page.getByText('${filter.name}')).toBeVisible();`);
    }
    suggestions.push(`});`);
    suggestions.push('');
  }

  if (result.listSections && result.listSections.length > 0) {
    for (const section of result.listSections.slice(0, 3)) {
      suggestions.push(`test('${name} - ${section.name} section is visible', async ({ page }) => {`);
      suggestions.push(`  await expect(page.getByText('${section.name}')).toBeVisible();`);
      suggestions.push(`});`);
      suggestions.push('');
    }
  }

  if (result.hasAlleFilterModal) {
    suggestions.push(`test('${name} - Alle Filter modal opens and closes', async ({ page }) => {`);
    suggestions.push(`  await page.getByText('Alle Filter').click();`);
    suggestions.push(`  // Assert modal is visible`);
    suggestions.push(`  await expect(page.getByRole('dialog')).toBeVisible();`);
    suggestions.push(`  // Close with X`);
    suggestions.push(`  await page.getByRole('button', { name: /close|schlie/i }).click();`);
    suggestions.push(`  await expect(page.getByRole('dialog')).not.toBeVisible();`);
    suggestions.push(`});`);
    suggestions.push('');
  }

  return suggestions;
}

export function buildPageMarkdown(result: PageInspectionResult): string {
  const lines: string[] = [];
  lines.push(`# ${result.pageName} — Inspection Report`);
  lines.push(`**Inspected:** ${result.timestamp}`);
  lines.push(`**URL:** \`${result.url}\``);
  lines.push(`**Title:** ${result.title}`);
  lines.push('');
  lines.push(`**Screenshot:** \`${result.screenshotPath}\``);
  lines.push(`**DOM:** \`${result.domPath}\``);
  lines.push(`**Accessibility:** \`${result.a11yPath}\``);
  lines.push('');

  if (result.error) {
    lines.push(`> **ERROR:** ${result.error}`);
    lines.push('');
  }

  if (result.filters.length > 0) {
    lines.push('## Filters');
    for (const f of result.filters) {
      lines.push(`### ${f.name}`);
      lines.push(`- **Type:** ${f.type}`);
      lines.push(`- **Locator:** \`${f.locator}\``);
      lines.push(`- **Has Reset:** ${f.hasResetButton}`);
      if (f.options.length > 0) {
        lines.push(`- **Options:** ${f.options.join(', ')}`);
      }
      lines.push('');
    }
  }

  if (result.listSections.length > 0) {
    lines.push('## List Sections');
    for (const s of result.listSections) {
      lines.push(`### ${s.name}`);
      lines.push(`- **Item Count:** ${s.itemCount}`);
      if (s.visibleItems.length > 0) {
        lines.push(`- **Visible Items:** ${s.visibleItems.slice(0, 5).join(', ')}`);
      }
      if (s.buttons.length > 0) {
        lines.push(`- **Buttons:** ${s.buttons.join(', ')}`);
      }
      lines.push('');
    }
  }

  if (result.modals.length > 0) {
    lines.push('## Modals');
    for (const m of result.modals) {
      lines.push(`### ${m.name}`);
      lines.push(`- **Triggered by:** ${m.triggeredBy}`);
      lines.push(`- **Close method:** ${m.closeMethod}`);
      lines.push(`- **Screenshot:** \`${m.screenshotPath}\``);
      lines.push(`- **DOM:** \`${m.domPath}\``);
      if (m.fields.length > 0) {
        lines.push(`- **Fields:** ${m.fields.join(', ')}`);
      }
      if (m.buttons.length > 0) {
        lines.push(`- **Buttons:** ${m.buttons.join(', ')}`);
      }
      lines.push('');
    }
  }

  if (result.sidePanels.length > 0) {
    lines.push('## Side Panels');
    for (const sp of result.sidePanels) {
      lines.push(`### Side Panel`);
      lines.push(`- **Triggered by:** ${sp.triggeredBy}`);
      lines.push(`- **Close method:** ${sp.closeMethod}`);
      lines.push(`- **Screenshot:** \`${sp.screenshotPath}\``);
      lines.push(`- **DOM:** \`${sp.domPath}\``);
      if (sp.sections.length > 0) lines.push(`- **Sections:** ${sp.sections.join(', ')}`);
      if (sp.fields.length > 0) lines.push(`- **Fields:** ${sp.fields.slice(0, 10).join(', ')}`);
      if (sp.buttons.length > 0) lines.push(`- **Buttons:** ${sp.buttons.join(', ')}`);
      if (sp.tabs.length > 0) lines.push(`- **Tabs:** ${sp.tabs.join(', ')}`);
      lines.push('');
    }
  }

  lines.push('## Visible Buttons');
  for (const btn of result.buttons.slice(0, 30)) {
    const safety = classifyButton(btn.text, btn.ariaLabel);
    const label = btn.text || btn.ariaLabel || '(no label)';
    lines.push(`- \`${label}\` — ${safety}`);
  }
  lines.push('');

  lines.push('## Visible Inputs');
  for (const inp of result.inputs.slice(0, 20)) {
    const label = inp.placeholder || inp.ariaLabel || inp.name || inp.id || '(no label)';
    lines.push(`- \`${label}\` (type: ${inp.type || 'text'})`);
  }
  lines.push('');

  if (result.tabs.length > 0) {
    lines.push('## Tabs');
    for (const tab of result.tabs) {
      lines.push(`- \`${tab.text}\``);
    }
    lines.push('');
  }

  if (result.locators.length > 0) {
    lines.push('## Suggested Locators');
    for (const loc of result.locators.slice(0, 20)) {
      lines.push(`### ${loc.element}`);
      lines.push(`\`\`\`typescript`);
      lines.push(loc.locator);
      lines.push(`\`\`\``);
      lines.push(`- **Strategy:** ${loc.strategy} | **Stability:** ${loc.stability}`);
      lines.push(`- *${loc.notes}*`);
      lines.push('');
    }
  }

  if (result.testSuggestions.length > 0) {
    lines.push('## Suggested Playwright Tests');
    lines.push('```typescript');
    lines.push(result.testSuggestions.join('\n'));
    lines.push('```');
    lines.push('');
  }

  if (result.risks.length > 0) {
    lines.push('## Risks and Unclear Behavior');
    for (const risk of result.risks) {
      lines.push(`- ${risk}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function buildFullReport(results: PageInspectionResult[]): string {
  const lines: string[] = [];
  lines.push('# Full Application Inspection Report');
  lines.push(`**Generated:** ${humanTimestamp()}`);
  lines.push(`**Pages inspected:** ${results.length}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Page | Status | Filters | Sections | Modals | Side Panels |');
  lines.push('|------|--------|---------|----------|--------|-------------|');

  for (const r of results) {
    const status = r.error ? '❌ ERROR' : '✅ OK';
    lines.push(
      `| ${r.pageName} | ${status} | ${r.filters.length} | ${r.listSections.length} | ${r.modals.length} | ${r.sidePanels.length} |`
    );
  }

  lines.push('');
  lines.push('## Page Details');
  lines.push('');

  for (const r of results) {
    lines.push(`### [${r.pageName}](../pages/${r.pageId}.md)`);
    lines.push(`- URL: \`${r.url}\``);
    lines.push(`- Inspected: ${r.timestamp}`);
    if (r.error) lines.push(`- **Error:** ${r.error}`);
    lines.push('');
  }

  return lines.join('\n');
}

export function saveAllInventories(results: PageInspectionResult[]): void {
  const allButtons = results.flatMap((r) =>
    r.buttons.map((b) => ({
      page: r.pageId,
      text: b.text,
      ariaLabel: b.ariaLabel,
      dataTestId: b.dataTestId,
      safetyClass: classifyButton(b.text, b.ariaLabel),
    }))
  );

  const allFilters = results.flatMap((r) =>
    r.filters.map((f) => ({ page: r.pageId, ...f }))
  );

  const allModals = results.flatMap((r) =>
    r.modals.map((m) => ({ page: r.pageId, ...m }))
  );

  const allSidePanels = results.flatMap((r) =>
    r.sidePanels.map((sp) => ({ page: r.pageId, ...sp }))
  );

  const allLocators = results.flatMap((r) =>
    r.locators.map((l) => ({ page: r.pageId, ...l }))
  );

  const appMap = {
    generatedAt: humanTimestamp(),
    pages: results.map((r) => ({
      id: r.pageId,
      name: r.pageName,
      url: r.url,
      inspectedAt: r.timestamp,
      status: r.error ? 'error' : 'ok',
      filterCount: r.filters.length,
      sectionCount: r.listSections.length,
      modalCount: r.modals.length,
      sidePanelCount: r.sidePanels.length,
      buttonCount: r.buttons.length,
    })),
  };

  const componentInventory = results.map((r) => ({
    page: r.pageId,
    filters: r.filters,
    listSections: r.listSections,
    tabs: r.tabs.map((t) => t.text),
    sidebarItems: r.sidebarItems || [],
  }));

  const navigationPaths = results.map((r) => ({
    page: r.pageId,
    name: r.pageName,
    url: r.url,
    reachableVia: 'direct URL or sidebar navigation',
  }));

  saveJson(outputPath('data', 'application-map.json'), appMap);
  saveJson(outputPath('data', 'component-inventory.json'), componentInventory);
  saveJson(outputPath('data', 'locator-inventory.json'), allLocators);
  saveJson(outputPath('data', 'filter-inventory.json'), allFilters);
  saveJson(outputPath('data', 'modal-inventory.json'), allModals);
  saveJson(outputPath('data', 'side-panel-inventory.json'), allSidePanels);
  saveJson(outputPath('data', 'button-inventory.json'), allButtons);
  saveJson(outputPath('data', 'navigation-paths.json'), navigationPaths);

  console.log('[REPORTER] Saved all inventory JSON files');
}

export function saveTestSuggestions(results: PageInspectionResult[]): void {
  const lines: string[] = [];
  lines.push('# Suggested Playwright Tests');
  lines.push(`**Generated:** ${humanTimestamp()}`);
  lines.push('');
  lines.push('```typescript');
  lines.push("import { test, expect } from '@playwright/test';");
  lines.push('');

  for (const result of results) {
    lines.push(`// ========== ${result.pageName} ==========`);
    lines.push(...result.testSuggestions);
    lines.push('');
  }

  lines.push('```');

  saveText(outputPath('test-suggestions', 'suggested-playwright-tests.md'), lines.join('\n'));
  console.log('[REPORTER] Saved suggested-playwright-tests.md');
}
