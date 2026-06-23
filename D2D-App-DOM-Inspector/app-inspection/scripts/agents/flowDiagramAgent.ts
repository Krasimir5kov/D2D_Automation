import { saveText, outputPath } from '../../helpers/filesystem';
import { PageInspectionResult } from '../../helpers/reporter';

function sanitizeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function buildAppFlowMermaid(results: PageInspectionResult[]): string {
  const lines: string[] = [
    'flowchart TD',
    '    App["D2D Application"]',
    '',
  ];

  for (const r of results) {
    const pid = sanitizeId(r.pageId);
    lines.push(`    ${pid}["${r.pageName}"]`);
    lines.push(`    App --> ${pid}`);
    lines.push('');

    // List sections → side panel
    if (r.listSections && r.listSections.length > 0) {
      for (const s of r.listSections) {
        const sid = `${pid}_${sanitizeId(s.name)}`;
        lines.push(`    ${sid}["${s.name}"]`);
        lines.push(`    ${pid} --> ${sid}`);
        if (r.hasSidePanel) {
          const spid = `${pid}_sp`;
          lines.push(`    ${spid}["Side Panel"]`);
          lines.push(`    ${sid} -->|click item| ${spid}`);
          lines.push(`    ${spid} -->|navigate away| ${pid}`);
        }
      }
      lines.push('');
    }

    // Alle Filter modal
    if (r.hasAlleFilterModal) {
      const mid = `${pid}_afm`;
      lines.push(`    ${mid}["Alle Filter Modal"]`);
      lines.push(`    ${pid} -->|alle Filter button| ${mid}`);
      lines.push(`    ${mid} -->|X close| ${pid}`);
      lines.push('');
    }

    // Create modals
    for (const m of r.modals) {
      if (m.name !== 'Alle Filter') {
        const mid = `${pid}_modal_${sanitizeId(m.name)}`;
        lines.push(`    ${mid}["${m.name}"]`);
        lines.push(`    ${pid} -->|${m.triggeredBy}| ${mid}`);
        lines.push(`    ${mid} -->|X close| ${pid}`);
        lines.push('');
      }
    }

    // Konfiguration sidebar
    if (r.pageId === 'konfiguration' && r.sidebarItems && r.sidebarItems.length > 0) {
      const sbid = `${pid}_sidebar`;
      lines.push(`    ${sbid}["Sidebar"]`);
      lines.push(`    ${pid} --> ${sbid}`);
      for (const item of r.sidebarItems.slice(0, 8)) {
        const iid = `${pid}_sb_${sanitizeId(item)}`;
        lines.push(`    ${iid}["${item}"]`);
        lines.push(`    ${sbid} -->|click| ${iid}`);
      }
      lines.push('');
    }
  }

  // Mark blocked actions
  lines.push('    BLOCKED_SAVE["⛔ Save / Submit / Delete"]');
  lines.push('    style BLOCKED_SAVE fill:#ffcccc,stroke:#cc0000');

  return lines.join('\n');
}

export function buildComponentFlowMermaid(results: PageInspectionResult[]): string {
  const lines: string[] = [
    'flowchart LR',
    '',
  ];

  for (const r of results) {
    const pid = sanitizeId(r.pageId);
    lines.push(`    subgraph ${pid}_group["${r.pageName}"]`);

    if (r.filters && r.filters.length > 0) {
      lines.push(`        ${pid}_f["Filters (${r.filters.length})"]`);
    }

    for (const s of r.listSections) {
      lines.push(`        ${pid}_${sanitizeId(s.name)}["${s.name} (${s.itemCount})"]`);
    }

    if (r.hasAlleFilterModal) {
      lines.push(`        ${pid}_afm["Alle Filter Modal"]`);
    }

    if (r.hasSidePanel) {
      lines.push(`        ${pid}_sp["Side Panel"]`);
    }

    if (r.pageId === 'konfiguration' && r.sidebarItems) {
      lines.push(`        ${pid}_sidebar["Sidebar (${r.sidebarItems.length} items)"]`);
    }

    lines.push('    end');
    lines.push('');
  }

  // Connect list sections to side panels
  for (const r of results) {
    if (!r.hasSidePanel) continue;
    const pid = sanitizeId(r.pageId);
    for (const s of r.listSections) {
      lines.push(`    ${pid}_${sanitizeId(s.name)} -->|click item| ${pid}_sp`);
    }
  }

  // Connect modals
  for (const r of results) {
    if (!r.hasAlleFilterModal) continue;
    const pid = sanitizeId(r.pageId);
    lines.push(`    ${pid}_f -->|alle Filter| ${pid}_afm`);
  }

  return lines.join('\n');
}

export function saveDiagrams(results: PageInspectionResult[]): void {
  const appFlow = buildAppFlowMermaid(results);
  saveText(outputPath('flows', 'application-flow.mmd'), appFlow);

  const componentFlow = buildComponentFlowMermaid(results);
  saveText(outputPath('flows', 'page-component-flow.mmd'), componentFlow);

  console.log('[FLOW] Saved application-flow.mmd and page-component-flow.mmd');
}
