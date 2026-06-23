import { Page } from '@playwright/test';
import { humanTimestamp, outputPath, saveJson } from '../../helpers/filesystem';
import { PageInspectionResult } from '../../helpers/reporter';
import { PageConfig, PAGES } from '../../helpers/page-map';

import * as navAgent from './navigationAgent';
import * as pageDomAgent from './pageDomAgent';
import * as filterAgent from './filterInspectionAgent';
import * as modalAgent from './modalInspectionAgent';
import * as sidePanelAgent from './sidePanelInspectionAgent';
import * as locatorAgent from './locatorAgent';
import * as assertionAgent from './assertionAgent';
import * as reporterAgent from './reporterAgent';

export interface InspectionRun {
  startedAt: string;
  finishedAt: string;
  baseUrl: string;
  pages: PageInspectionResult[];
  totalErrors: number;
}

export async function runPageInspection(
  page: Page,
  config: PageConfig,
  baseUrl: string
): Promise<PageInspectionResult> {
  const result: PageInspectionResult = {
    pageId: config.id,
    pageName: config.name,
    url: '',
    timestamp: humanTimestamp(),
    title: '',
    screenshotPath: '',
    domPath: '',
    a11yPath: '',
    buttons: [],
    links: [],
    inputs: [],
    selects: [],
    checkboxes: [],
    tabs: [],
    filters: [],
    listSections: [],
    modals: [],
    sidePanels: [],
    locators: [],
    testSuggestions: [],
    risks: [],
    hasSidePanel: config.hasSidePanel,
    hasAlleFilterModal: config.hasAlleFilterModal,
    hasCreateModal: config.hasCreateModal,
    sidebarItems: [],
  };

  console.log(`\n[ORCHESTRATOR] ═══ ${config.name} ═══`);

  // ── Step 1: Navigation ──────────────────────────────────────
  console.log(`  [1/7] Navigation Agent`);
  const navResult = await navAgent.navigateToPage(page, config.id, baseUrl);
  result.risks.push(...navResult.risks);
  if (!navResult.reached) {
    result.error = `Navigation failed: ${navResult.risks.join('; ')}`;
    return result;
  }
  result.url = page.url();

  // ── Step 2: Page DOM capture ────────────────────────────────
  console.log(`  [2/7] Page DOM Agent`);
  try {
    const state = await pageDomAgent.capturePageState(page, config.id);
    result.title = state.title;
    result.screenshotPath = state.screenshotPath;
    result.domPath = state.domPath;
    result.a11yPath = state.a11yPath;
    result.buttons = state.elements.buttons;
    result.links = state.elements.links;
    result.inputs = state.elements.inputs;
    result.selects = state.elements.selects;
    result.checkboxes = state.elements.checkboxes;
    result.tabs = state.elements.tabs;

    result.listSections = await pageDomAgent.captureListSections(page, config.listSections);
  } catch (err) {
    result.risks.push(`Page DOM capture failed: ${err}`);
  }

  // ── Step 3: Filter inspection ───────────────────────────────
  console.log(`  [3/7] Filter Inspection Agent`);
  try {
    result.filters = await filterAgent.discoverAndInspectFilters(page, config.id);
    console.log(`       Found ${result.filters.length} filters`);
  } catch (err) {
    result.risks.push(`Filter inspection failed: ${err}`);
  }

  // ── Step 4: Modal inspection ────────────────────────────────
  console.log(`  [4/7] Modal Inspection Agent`);
  try {
    if (config.hasAlleFilterModal) {
      await navAgent.navigateToPage(page, config.id, baseUrl);
      const modal = await modalAgent.inspectAlleFilterModal(page, config.id);
      if (modal) result.modals.push(modal);
    }

    if (config.hasCreateModal) {
      const createKeywords = ['Benutzer anlegen', 'Neuer Benutzer', 'Team erstellen', 'Neue Organisation'];
      for (const keyword of createKeywords) {
        const modalResult = await modalAgent.openAndInspectCreateModal(page, config.id, keyword);
        if (modalResult) result.modals.push(modalResult);
      }
    }
  } catch (err) {
    result.risks.push(`Modal inspection failed: ${err}`);
    await modalAgent.closeModal(page).catch(() => {});
  }

  // ── Step 5: Side panel inspection ──────────────────────────
  console.log(`  [5/7] Side Panel Inspection Agent`);
  try {
    if (config.hasSidePanel && result.listSections.length > 0) {
      for (const section of result.listSections.slice(0, 3)) {
        await navAgent.navigateToPage(page, config.id, baseUrl);
        await page.waitForTimeout(800);
        const sp = await sidePanelAgent.clickSectionItemAndInspect(page, config.id, section.name, page.url());
        if (sp) result.sidePanels.push(sp);
      }
    }
  } catch (err) {
    result.risks.push(`Side panel inspection failed: ${err}`);
  }

  // ── Step 6: Locator generation ──────────────────────────────
  console.log(`  [6/7] Locator Agent`);
  result.locators = locatorAgent.generateLocators(result.buttons, config.id);

  // ── Step 7: Assertion generation ────────────────────────────
  console.log(`  [7/7] Assertion Agent`);
  result.testSuggestions = assertionAgent.generateAssertions(result);

  // Save partial report immediately
  reporterAgent.savePageReport(result);
  console.log(`  [ORCHESTRATOR] ✅ ${config.name} complete`);

  return result;
}

export async function runFullInspection(page: Page, baseUrl: string): Promise<InspectionRun> {
  const startedAt = humanTimestamp();
  const results: PageInspectionResult[] = [];

  for (const config of PAGES) {
    try {
      const result = await runPageInspection(page, config, baseUrl);
      results.push(result);
    } catch (err) {
      console.log(`  [ORCHESTRATOR] ❌ ${config.name} failed: ${err}`);
      results.push({
        pageId: config.id, pageName: config.name, url: '', timestamp: humanTimestamp(),
        title: '', screenshotPath: '', domPath: '', a11yPath: '',
        buttons: [], links: [], inputs: [], selects: [], checkboxes: [], tabs: [],
        filters: [], listSections: [], modals: [], sidePanels: [],
        locators: [], testSuggestions: [], risks: [`Page inspection failed: ${err}`],
        hasSidePanel: config.hasSidePanel, hasAlleFilterModal: config.hasAlleFilterModal,
        hasCreateModal: config.hasCreateModal, error: String(err),
      });
    }
  }

  const finishedAt = humanTimestamp();

  // Save all reports
  reporterAgent.saveFullReport(results);
  reporterAgent.saveInventories(results);
  reporterAgent.saveTestSuggestions(results);

  const run: InspectionRun = {
    startedAt,
    finishedAt,
    baseUrl,
    pages: results,
    totalErrors: results.filter((r) => r.error).length,
  };

  saveJson(outputPath('data', 'inspection-run.json'), run);

  return run;
}
