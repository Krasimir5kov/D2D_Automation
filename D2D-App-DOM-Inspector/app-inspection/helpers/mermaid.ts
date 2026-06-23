import { saveText, outputPath } from './filesystem';
import { PageInspectionResult } from './reporter';

export function generateApplicationFlowDiagram(results: PageInspectionResult[]): string {
  const lines: string[] = [
    'flowchart TD',
    '    App["Internal Application"]',
    '',
  ];

  for (const result of results) {
    const pageId = result.pageId.replace(/-/g, '_');
    const pageName = result.pageName;
    lines.push(`    ${pageId}["${pageName}"]`);
    lines.push(`    App --> ${pageId}`);
    lines.push('');

    // Filters
    if (result.filters && result.filters.length > 0) {
      const filterId = `${pageId}_filters`;
      lines.push(`    ${filterId}["Filters"]`);
      lines.push(`    ${pageId} --> ${filterId}`);
      for (const f of result.filters.slice(0, 5)) {
        const fId = `${pageId}_filter_${sanitizeId(f.name)}`;
        lines.push(`    ${fId}["${f.name}"]`);
        lines.push(`    ${filterId} --> ${fId}`);
      }
      lines.push('');
    }

    // List sections
    if (result.listSections && result.listSections.length > 0) {
      for (const section of result.listSections) {
        const sId = `${pageId}_${sanitizeId(section.name)}`;
        lines.push(`    ${sId}["${section.name}"]`);
        lines.push(`    ${pageId} --> ${sId}`);
        if (result.hasSidePanel) {
          const spId = `${pageId}_sidepanel`;
          lines.push(`    ${spId}["Side Panel"]`);
          lines.push(`    ${sId} -->|click item| ${spId}`);
          lines.push(`    ${spId} -->|close| ${pageId}`);
        }
      }
      lines.push('');
    }

    // Alle Filter modal
    if (result.hasAlleFilterModal) {
      const modalId = `${pageId}_alle_filter`;
      lines.push(`    ${modalId}["Alle Filter Modal"]`);
      lines.push(`    ${pageId} -->|Alle Filter button| ${modalId}`);
      lines.push(`    ${modalId} -->|X close| ${pageId}`);
      lines.push('');
    }

    // Create modals
    if (result.hasCreateModal) {
      const cmId = `${pageId}_create_modal`;
      lines.push(`    ${cmId}["Create Modal(s)"]`);
      lines.push(`    ${pageId} -->|create button| ${cmId}`);
      lines.push(`    ${cmId} -->|X close| ${pageId}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function generatePageComponentFlowDiagram(results: PageInspectionResult[]): string {
  const lines: string[] = [
    'flowchart LR',
    '',
  ];

  for (const result of results) {
    const pageId = result.pageId.replace(/-/g, '_');
    lines.push(`    subgraph ${pageId}_group["${result.pageName}"]`);

    if (result.filters && result.filters.length > 0) {
      lines.push(`        ${pageId}_f["Filters (${result.filters.length})"]`);
    }

    if (result.listSections && result.listSections.length > 0) {
      for (const section of result.listSections) {
        const sId = sanitizeId(section.name);
        lines.push(`        ${pageId}_${sId}["${section.name}"]`);
      }
    }

    if (result.hasAlleFilterModal) {
      lines.push(`        ${pageId}_afm["Alle Filter Modal"]`);
    }

    if (result.hasSidePanel) {
      lines.push(`        ${pageId}_sp["Side Panel"]`);
    }

    lines.push('    end');
    lines.push('');
  }

  // Configuration sidebar
  const konfig = results.find((r) => r.pageId === 'konfiguration');
  if (konfig && konfig.sidebarItems && konfig.sidebarItems.length > 0) {
    lines.push('    subgraph konfiguration_sidebar["Konfiguration Sidebar"]');
    for (const item of konfig.sidebarItems.slice(0, 10)) {
      lines.push(`        kfg_${sanitizeId(item)}["${item}"]`);
    }
    lines.push('    end');
    lines.push('    konfiguration_group --> konfiguration_sidebar');
  }

  return lines.join('\n');
}

function sanitizeId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function saveMermaidDiagrams(results: PageInspectionResult[]): void {
  const appFlow = generateApplicationFlowDiagram(results);
  saveText(outputPath('flows', 'application-flow.mmd'), appFlow);

  const componentFlow = generatePageComponentFlowDiagram(results);
  saveText(outputPath('flows', 'page-component-flow.mmd'), componentFlow);

  console.log('[MERMAID] Saved application-flow.mmd and page-component-flow.mmd');
}
