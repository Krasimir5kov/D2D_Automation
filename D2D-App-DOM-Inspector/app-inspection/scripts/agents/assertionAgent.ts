import { PageInspectionResult } from '../../helpers/reporter';

export function generateAssertions(result: Partial<PageInspectionResult>): string[] {
  const lines: string[] = [];
  const name = result.pageName || result.pageId || 'Page';
  const url = result.url || '';
  const pageId = result.pageId || '';

  // Navigation assertion
  lines.push(`test('${name} — page loads without errors', async ({ page }) => {`);
  if (url) lines.push(`  await page.goto('${url}');`);
  lines.push(`  await expect(page).not.toHaveURL(/error|404|500/);`);
  lines.push(`  await expect(page.locator('body')).not.toContainText('Page not found');`);
  if (result.title) lines.push(`  // Expected title: "${result.title}"`);
  lines.push(`});`);
  lines.push('');

  // List section assertions
  if (result.listSections && result.listSections.length > 0) {
    for (const section of result.listSections.slice(0, 4)) {
      lines.push(`test('${name} — "${section.name}" section is visible', async ({ page }) => {`);
      if (url) lines.push(`  await page.goto('${url}');`);
      lines.push(`  await expect(page.getByText('${section.name}', { exact: false })).toBeVisible();`);
      if (section.itemCount > 0) {
        lines.push(`  // Section had ${section.itemCount} items during inspection`);
      }
      lines.push(`});`);
      lines.push('');
    }
  }

  // Filter assertions
  if (result.filters && result.filters.length > 0) {
    lines.push(`test('${name} — filters are visible', async ({ page }) => {`);
    if (url) lines.push(`  await page.goto('${url}');`);
    for (const filter of result.filters.slice(0, 3)) {
      lines.push(`  // Filter: "${filter.name}" (${filter.type})`);
      if (filter.locator) lines.push(`  await expect(${filter.locator}).toBeVisible();`);
    }
    lines.push(`});`);
    lines.push('');

    for (const filter of result.filters.slice(0, 2)) {
      if (filter.options.length > 0) {
        lines.push(`test('${name} — "${filter.name}" filter shows options', async ({ page }) => {`);
        if (url) lines.push(`  await page.goto('${url}');`);
        lines.push(`  await (${filter.locator}).click();`);
        lines.push(`  await expect(page.getByRole('listbox')).toBeVisible();`);
        for (const opt of filter.options.slice(0, 3)) {
          lines.push(`  await expect(page.getByRole('option', { name: '${escapeStr(opt)}' })).toBeVisible();`);
        }
        lines.push(`  await page.keyboard.press('Escape');`);
        lines.push(`});`);
        lines.push('');
      }
    }
  }

  // Alle Filter modal assertion
  if (result.hasAlleFilterModal) {
    const modal = result.modals?.find((m) => m.name === 'Alle Filter');
    lines.push(`test('${name} — Alle Filter modal opens and closes with ×', async ({ page }) => {`);
    if (url) lines.push(`  await page.goto('${url}');`);
    lines.push(`  await page.getByText('alle Filter', { exact: false }).click();`);
    lines.push(`  await expect(page.getByRole('dialog')).toBeVisible();`);
    if (modal?.fields && modal.fields.length > 0) {
      lines.push(`  // Modal contains: ${modal.fields.slice(0, 3).join(', ')}`);
      for (const f of modal.fields.slice(0, 2)) {
        if (f.length > 2 && f.length < 50) {
          lines.push(`  await expect(page.getByRole('dialog').getByText('${escapeStr(f)}')).toBeVisible();`);
        }
      }
    }
    lines.push(`  await page.locator('[role="dialog"] button').filter({ hasText: '×' }).click();`);
    lines.push(`  await expect(page.getByRole('dialog')).not.toBeVisible();`);
    lines.push(`});`);
    lines.push('');
  }

  // Side panel assertions
  if (result.sidePanels && result.sidePanels.length > 0) {
    const sp = result.sidePanels[0];
    lines.push(`test('${name} — clicking a list item opens the side panel', async ({ page }) => {`);
    if (url) lines.push(`  await page.goto('${url}');`);
    lines.push(`  // Click a list item to open the side panel`);
    lines.push(`  // await page.getByText('item name here').click();`);
    lines.push(`  await expect(page.locator('[class*="side-panel"], [class*="drawer"]').first()).toBeVisible();`);
    if (sp.tabs.length > 0) {
      lines.push(`  // Side panel tabs: ${sp.tabs.join(', ')}`);
    }
    if (sp.sections.length > 0) {
      lines.push(`  // Side panel sections: ${sp.sections.slice(0, 3).join(', ')}`);
    }
    lines.push(`});`);
    lines.push('');
  }

  // Create modal assertions (Benutzerverwaltung)
  if (result.hasCreateModal && result.modals && result.modals.length > 0) {
    for (const modal of result.modals.slice(0, 2)) {
      lines.push(`test('${name} — "${modal.name}" opens and can be closed', async ({ page }) => {`);
      if (url) lines.push(`  await page.goto('${url}');`);
      lines.push(`  // Trigger: ${modal.triggeredBy}`);
      lines.push(`  // await page.getByRole('button', { name: '${escapeStr(modal.triggeredBy)}' }).click();`);
      lines.push(`  await expect(page.getByRole('dialog')).toBeVisible();`);
      lines.push(`  await page.locator('[role="dialog"] button').filter({ hasText: '×' }).click();`);
      lines.push(`  await expect(page.getByRole('dialog')).not.toBeVisible();`);
      lines.push(`});`);
      lines.push('');
    }
  }

  return lines;
}

function escapeStr(s: string): string {
  return s.replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
}
