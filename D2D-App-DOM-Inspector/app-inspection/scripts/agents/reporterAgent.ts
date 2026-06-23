import {
  saveJson,
  saveText,
  outputPath,
  pageMdPath,
  humanTimestamp,
} from '../../helpers/filesystem';
import {
  PageInspectionResult,
  LocatorSuggestion,
} from '../../helpers/reporter';
import { classifyButton } from '../../helpers/safe-actions';

export function buildPageMarkdown(result: PageInspectionResult): string {
  const lines: string[] = [];
  lines.push(`<!-- pageId: ${result.pageId}, generatedAt: ${result.timestamp} -->`);
  lines.push(`# ${result.pageName} — Inspection Report`);
  lines.push(`**Inspected:** ${result.timestamp}  `);
  lines.push(`**URL:** \`${result.url}\`  `);
  lines.push(`**Title:** ${result.title}  `);
  lines.push(`**Screenshot:** \`${result.screenshotPath}\`  `);
  lines.push(`**DOM:** \`${result.domPath}\`  `);
  lines.push(`**Accessibility:** \`${result.a11yPath}\`  `);
  lines.push('');

  if (result.error) {
    lines.push(`> ❌ **ERROR:** ${result.error}`);
    lines.push('');
  }

  // Filters
  if (result.filters.length > 0) {
    lines.push('## Filters');
    for (const f of result.filters) {
      lines.push(`### ${f.name}`);
      lines.push(`- **Type:** ${f.type}  **Has Reset:** ${f.hasResetButton}`);
      lines.push(`- **Locator:** \`${f.locator}\``);
      if (f.options.length > 0) lines.push(`- **Options:** ${f.options.join(', ')}`);
      lines.push('');
    }
  }

  // List sections
  if (result.listSections.length > 0) {
    lines.push('## List Sections');
    for (const s of result.listSections) {
      lines.push(`### ${s.name}`);
      lines.push(`- **Items found:** ${s.itemCount}`);
      if (s.visibleItems.length > 0) lines.push(`- **Sample items:** ${s.visibleItems.join(', ')}`);
      if (s.buttons.length > 0) lines.push(`- **Buttons:** ${s.buttons.join(', ')}`);
      lines.push('');
    }
  }

  // Modals
  if (result.modals.length > 0) {
    lines.push('## Modals');
    for (const m of result.modals) {
      const status = m.screenshotPath ? '✅' : '⚠️';
      lines.push(`### ${status} ${m.name}`);
      lines.push(`- **Triggered by:** ${m.triggeredBy}`);
      lines.push(`- **Close method:** ${m.closeMethod}`);
      lines.push(`- **Screenshot:** \`${m.screenshotPath}\``);
      lines.push(`- **DOM:** \`${m.domPath}\``);
      if (m.fields.length > 0) lines.push(`- **Fields/Sections:** ${m.fields.slice(0, 10).join(', ')}`);
      if (m.buttons.length > 0) lines.push(`- **Buttons:** ${m.buttons.join(', ')}`);
      lines.push('');
    }
  }

  // Side panels
  if (result.sidePanels.length > 0) {
    lines.push('## Side Panels');
    for (const sp of result.sidePanels) {
      lines.push(`### Side Panel — ${sp.triggeredBy}`);
      lines.push(`- **Close method:** ${sp.closeMethod}`);
      lines.push(`- **Screenshot:** \`${sp.screenshotPath}\``);
      if (sp.sections.length > 0) lines.push(`- **Sections:** ${sp.sections.join(', ')}`);
      if (sp.fields.length > 0) lines.push(`- **Fields:** ${sp.fields.slice(0, 10).join(', ')}`);
      if (sp.buttons.length > 0) lines.push(`- **Buttons:** ${sp.buttons.join(', ')}`);
      if (sp.tabs.length > 0) lines.push(`- **Tabs:** ${sp.tabs.join(', ')}`);
      lines.push('');
    }
  }

  // Buttons with safety classification
  if (result.buttons.length > 0) {
    lines.push('## Buttons (with safety classification)');
    lines.push('| Label | Safety Class |');
    lines.push('|-------|-------------|');
    for (const btn of result.buttons.slice(0, 30)) {
      const label = btn.text || btn.ariaLabel || '(no label)';
      const cls = classifyButton(btn.text, btn.ariaLabel);
      const icon = ['DESTRUCTIVE'].includes(cls) ? '⛔' : ['RISKY_DATA_CHANGE'].includes(cls) ? '⚠️' : '✅';
      lines.push(`| ${icon} \`${label}\` | ${cls} |`);
    }
    lines.push('');
  }

  // Inputs
  if (result.inputs.length > 0) {
    lines.push('## Inputs');
    for (const inp of result.inputs.slice(0, 15)) {
      const label = inp.placeholder || inp.ariaLabel || inp.name || inp.id || '(no label)';
      lines.push(`- \`${label}\` (type: ${inp.type || 'text'})`);
    }
    lines.push('');
  }

  // Tabs
  if (result.tabs.length > 0) {
    lines.push('## Tabs');
    lines.push(result.tabs.map((t) => `\`${t.text}\``).join(', '));
    lines.push('');
  }

  // Locators
  if (result.locators.length > 0) {
    lines.push('## Suggested Locators');
    for (const loc of result.locators.slice(0, 20)) {
      lines.push(`### ${loc.element}`);
      lines.push('```typescript');
      lines.push(loc.locator);
      lines.push('```');
      lines.push(`- **Strategy:** ${loc.strategy} | **Stability:** ${loc.stability}`);
      lines.push(`- *${loc.notes}*`);
      lines.push('');
    }
  }

  // Test suggestions
  if (result.testSuggestions.length > 0) {
    lines.push('## Suggested Playwright Tests');
    lines.push('```typescript');
    lines.push(result.testSuggestions.join('\n'));
    lines.push('```');
    lines.push('');
  }

  // Risks
  if (result.risks.length > 0) {
    lines.push('## Risks and Notes');
    for (const risk of result.risks) {
      lines.push(`- ⚠️ ${risk}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function savePageReport(result: PageInspectionResult): void {
  const md = buildPageMarkdown(result);
  saveText(pageMdPath(result.pageId), md);
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
    lines.push(`| [${r.pageName}](../pages/${r.pageId}.md) | ${status} | ${r.filters.length} | ${r.listSections.length} | ${r.modals.length} | ${r.sidePanels.length} |`);
  }

  lines.push('');
  lines.push('## Page Details');
  for (const r of results) {
    lines.push(`### ${r.pageName}`);
    lines.push(`- URL: \`${r.url}\``);
    lines.push(`- Inspected: ${r.timestamp}`);
    if (r.error) lines.push(`- ❌ Error: ${r.error}`);
    lines.push('');
  }

  return lines.join('\n');
}

export function saveFullReport(results: PageInspectionResult[]): void {
  const report = buildFullReport(results);
  saveText(outputPath('reports', 'full-inspection-report.md'), report);
  console.log('[REPORTER] Saved full-inspection-report.md');
}

export function saveInventories(results: PageInspectionResult[]): void {
  const allButtons = results.flatMap((r) =>
    r.buttons.map((b) => ({
      page: r.pageId,
      text: b.text,
      ariaLabel: b.ariaLabel,
      dataTestId: b.dataTestId,
      safetyClass: classifyButton(b.text, b.ariaLabel),
    }))
  );

  saveJson(outputPath('data', 'application-map.json'), {
    generatedAt: humanTimestamp(),
    pages: results.map((r) => ({
      id: r.pageId, name: r.pageName, url: r.url,
      inspectedAt: r.timestamp, status: r.error ? 'error' : 'ok',
      filterCount: r.filters.length, sectionCount: r.listSections.length,
      modalCount: r.modals.length, sidePanelCount: r.sidePanels.length,
      buttonCount: r.buttons.length,
    })),
  });

  saveJson(outputPath('data', 'component-inventory.json'), results.map((r) => ({
    page: r.pageId,
    filters: r.filters,
    listSections: r.listSections,
    tabs: r.tabs.map((t) => t.text),
    sidebarItems: r.sidebarItems || [],
  })));

  saveJson(outputPath('data', 'locator-inventory.json'), results.flatMap((r) => r.locators.map((l) => ({ page: r.pageId, ...l }))));
  saveJson(outputPath('data', 'filter-inventory.json'), results.flatMap((r) => r.filters.map((f) => ({ page: r.pageId, ...f }))));
  saveJson(outputPath('data', 'modal-inventory.json'), results.flatMap((r) => r.modals.map((m) => ({ page: r.pageId, ...m }))));
  saveJson(outputPath('data', 'side-panel-inventory.json'), results.flatMap((r) => r.sidePanels.map((sp) => ({ page: r.pageId, ...sp }))));
  saveJson(outputPath('data', 'button-inventory.json'), allButtons);
  saveJson(outputPath('data', 'navigation-paths.json'), results.map((r) => ({
    page: r.pageId, name: r.pageName, url: r.url, status: r.error ? 'error' : 'ok',
  })));

  console.log('[REPORTER] Saved all inventory JSON files');
}

export function saveTestSuggestions(results: PageInspectionResult[]): void {
  const lines: string[] = [
    '# Suggested Playwright Tests',
    `**Generated:** ${humanTimestamp()}`,
    '',
    "```typescript",
    "import { test, expect } from '@playwright/test';",
    '',
  ];

  for (const r of results) {
    lines.push(`// ═══ ${r.pageName} ═══`);
    lines.push(r.testSuggestions.join('\n'));
    lines.push('');
  }

  lines.push('```');
  saveText(outputPath('test-suggestions', 'suggested-playwright-tests.md'), lines.join('\n'));
  console.log('[REPORTER] Saved suggested-playwright-tests.md');
}
