import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as readline from 'readline';

import { initOutputDirs, humanTimestamp } from '../helpers/filesystem';
import { safeNavigate } from '../helpers/safe-actions';
import { PAGES, getPageConfig } from '../helpers/page-map';

import * as navAgent from './agents/navigationAgent';
import * as pageDomAgent from './agents/pageDomAgent';
import * as filterAgent from './agents/filterInspectionAgent';
import * as modalAgent from './agents/modalInspectionAgent';
import * as sidePanelAgent from './agents/sidePanelInspectionAgent';
import * as locatorAgent from './agents/locatorAgent';
import * as assertionAgent from './agents/assertionAgent';
import * as reporterAgent from './agents/reporterAgent';
import { runPageExploration } from '../helpers/explorer';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const STORAGE_STATE_PATH = process.env.STORAGE_STATE_PATH || 'auth/storageState.json';

// ── Menu helpers ───────────────────────────────────────────────────────────────

function printMenu(): void {
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────────────┐');
  console.log('│  D2D App Inspector — Guided Mode                                │');
  console.log('├─────────────────────────────────────────────────────────────────┤');
  console.log('│  Type a target to inspect it. Examples:                         │');
  console.log('│                                                                  │');
  console.log('│  PAGES (inspect full page):                                     │');
  console.log('│    baulose / objekte / sales-action                             │');
  console.log('│    benutzerverwaltung / importe / konfiguration                 │');
  console.log('│                                                                  │');
  console.log('│  SPECIFIC TARGETS:                                              │');
  console.log('│    "<page> filters"          — inspect page filters             │');
  console.log('│    "<page> alle filter"      — inspect Alle Filter modal        │');
  console.log('│    "<page> side panel"       — inspect side panel               │');
  console.log('│    "<page> dom"              — capture DOM + screenshot         │');
  console.log('│    "<page> explore"          — full mouse exploration           │');
  console.log('│    "<page> locators"         — generate locators                │');
  console.log('│    "<page> assertions"       — generate test assertions         │');
  console.log('│                                                                  │');
  console.log('│  COMMANDS: "menu" | "pages" | "exit"                            │');
  console.log('└─────────────────────────────────────────────────────────────────┘');
  console.log('');
}

function printPages(): void {
  console.log('\nConfigured pages:');
  for (const p of PAGES) {
    const flags = [
      p.hasSidePanel ? 'side-panel' : '',
      p.hasAlleFilterModal ? 'alle-filter' : '',
      p.hasCreateModal ? 'create-modal' : '',
    ].filter(Boolean).join(', ');
    console.log(`  ${p.id.padEnd(24)} ${p.name} [${flags || 'basic'}]`);
  }
  console.log('');
}

// ── Target parser ──────────────────────────────────────────────────────────────

type TargetAction =
  | { pageId: string; action: 'filters' }
  | { pageId: string; action: 'alle-filter' }
  | { pageId: string; action: 'side-panel'; sectionName?: string }
  | { pageId: string; action: 'dom' }
  | { pageId: string; action: 'explore' }
  | { pageId: string; action: 'locators' }
  | { pageId: string; action: 'assertions' }
  | { pageId: string; action: 'full' }
  | { action: 'menu' }
  | { action: 'pages' }
  | { action: 'exit' }
  | { action: 'unknown'; input: string };

function parseTarget(input: string): TargetAction {
  const s = input.trim().toLowerCase();

  if (s === 'exit' || s === 'quit' || s === 'q') return { action: 'exit' };
  if (s === 'menu' || s === 'help' || s === '?') return { action: 'menu' };
  if (s === 'pages' || s === 'list') return { action: 'pages' };

  // Map common aliases
  const pageAliases: Record<string, string> = {
    bau: 'baulose', 'bau lose': 'baulose',
    obj: 'objekte',
    sales: 'sales-action', 'sales action': 'sales-action',
    benutzer: 'benutzerverwaltung', users: 'benutzerverwaltung',
    import: 'importe',
    konfig: 'konfiguration', config: 'konfiguration',
  };

  let pageId: string | null = null;
  let remainder = s;

  // Check exact page ids first
  for (const p of PAGES) {
    if (s === p.id || s.startsWith(p.id + ' ')) {
      pageId = p.id;
      remainder = s.slice(p.id.length).trim();
      break;
    }
  }

  // Check aliases
  if (!pageId) {
    for (const [alias, pid] of Object.entries(pageAliases)) {
      if (s === alias || s.startsWith(alias + ' ')) {
        pageId = pid;
        remainder = s.slice(alias.length).trim();
        break;
      }
    }
  }

  // Still no page — try partial match at start
  if (!pageId) {
    for (const p of PAGES) {
      if (s.startsWith(p.id.split('-')[0])) {
        pageId = p.id;
        remainder = s.slice(p.id.split('-')[0].length).trim();
        break;
      }
    }
  }

  if (!pageId) return { action: 'unknown', input };

  if (!remainder || remainder === 'full' || remainder === 'all') return { pageId, action: 'full' };
  if (remainder.includes('filter') && !remainder.includes('alle')) return { pageId, action: 'filters' };
  if (remainder.includes('alle') || remainder.includes('modal')) return { pageId, action: 'alle-filter' };
  if (remainder.includes('side') || remainder.includes('panel') || remainder.includes('detail')) {
    const sectionMatch = remainder.match(/section[:\s]+(.+)/) || remainder.match(/^(\w[\w\s-]+)$/);
    return { pageId, action: 'side-panel', sectionName: sectionMatch?.[1]?.trim() };
  }
  if (remainder.includes('dom') || remainder.includes('screenshot') || remainder.includes('capture'))
    return { pageId, action: 'dom' };
  if (remainder.includes('explor'))   return { pageId, action: 'explore' };
  if (remainder.includes('locator'))  return { pageId, action: 'locators' };
  if (remainder.includes('assert') || remainder.includes('test'))
    return { pageId, action: 'assertions' };

  return { pageId, action: 'full' };
}

// ── Action handlers ────────────────────────────────────────────────────────────

async function handleAction(page: Page, target: TargetAction): Promise<void> {
  if (target.action === 'exit' || target.action === 'menu' || target.action === 'pages') return;
  if (target.action === 'unknown') {
    console.log(`  Unknown target: "${target.input}". Type "menu" for help.`);
    return;
  }

  const config = getPageConfig(target.pageId);
  if (!config) {
    console.log(`  Unknown page: "${target.pageId}". Type "pages" to list pages.`);
    return;
  }

  console.log(`\n[GUIDED] ${target.action.toUpperCase()} — ${config.name}`);

  // Navigate to page first
  const navResult = await navAgent.navigateToPage(page, target.pageId, BASE_URL);
  if (!navResult.reached) {
    console.log(`  Could not navigate to ${config.name}: ${navResult.risks.join('; ')}`);
    return;
  }

  switch (target.action) {
    case 'dom': {
      const state = await pageDomAgent.capturePageState(page, config.id);
      console.log(`  Screenshot: ${state.screenshotPath}`);
      console.log(`  DOM:        ${state.domPath}`);
      console.log(`  A11y:       ${state.a11yPath}`);
      console.log(`  Buttons: ${state.elements.buttons.length}, Links: ${state.elements.links.length}, Inputs: ${state.elements.inputs.length}`);
      break;
    }

    case 'filters': {
      const filters = await filterAgent.discoverAndInspectFilters(page, config.id);
      if (filters.length === 0) {
        console.log('  No filters found on this page.');
      } else {
        console.log(`  Found ${filters.length} filter(s):`);
        for (const f of filters) {
          console.log(`    - ${f.name} (${f.type}) — ${f.options.length} options`);
          if (f.options.length > 0) console.log(`      Options: ${f.options.slice(0, 5).join(', ')}`);
        }
      }
      break;
    }

    case 'alle-filter': {
      if (!config.hasAlleFilterModal) {
        console.log(`  "${config.name}" does not have an Alle Filter modal according to configuration.`);
        console.log('  Attempting anyway...');
      }
      const modal = await modalAgent.inspectAlleFilterModal(page, config.id);
      if (!modal) {
        console.log('  Alle Filter modal not found or could not be opened.');
      } else {
        console.log(`  Modal: "${modal.name}"`);
        console.log(`  Fields/Sections: ${modal.fields.slice(0, 8).join(', ')}`);
        console.log(`  Buttons: ${modal.buttons.join(', ')}`);
        console.log(`  Screenshot: ${modal.screenshotPath}`);
        console.log(`  Closed via: ${modal.closeMethod}`);
      }
      break;
    }

    case 'side-panel': {
      const listSections = await pageDomAgent.captureListSections(page, config.listSections);
      if (listSections.length === 0) {
        console.log('  No list sections found on this page.');
        break;
      }

      const section = target.sectionName
        ? listSections.find((s) => s.name.toLowerCase().includes(target.sectionName!.toLowerCase()))
          ?? listSections[0]
        : listSections[0];

      console.log(`  Trying side panel from section: "${section.name}"`);
      const sp = await sidePanelAgent.clickSectionItemAndInspect(page, config.id, section.name, page.url());
      if (!sp) {
        console.log('  No side panel appeared.');
      } else {
        console.log(`  Side panel triggered by: "${sp.triggeredBy}"`);
        console.log(`  Sections: ${sp.sections.join(', ')}`);
        console.log(`  Fields: ${sp.fields.slice(0, 8).join(', ')}`);
        console.log(`  Tabs: ${sp.tabs.join(', ')}`);
        console.log(`  Screenshot: ${sp.screenshotPath}`);
      }
      break;
    }

    case 'explore': {
      console.log(`  Starting full mouse exploration on ${config.name}...`);
      const exploration = await runPageExploration(page, config.id, page.url());
      console.log(`  Explored: ${exploration.clicked}/${exploration.totalFound} elements clicked`);
      console.log(`  Skipped: ${exploration.skipped}`);
      console.log(`  By change type: ${JSON.stringify(exploration.byChangeType)}`);
      break;
    }

    case 'locators': {
      const state = await pageDomAgent.capturePageState(page, config.id);
      const locs = locatorAgent.generateLocators(state.elements.buttons, config.id);
      if (locs.length === 0) {
        console.log('  No locators generated.');
      } else {
        console.log(`  Generated ${locs.length} locator(s):`);
        for (const l of locs.slice(0, 10)) {
          console.log(`    [${l.stability}] ${l.element}`);
          console.log(`       ${l.locator}`);
        }
      }
      break;
    }

    case 'assertions': {
      const state = await pageDomAgent.capturePageState(page, config.id);
      const partial = {
        pageId: config.id,
        pageName: config.name,
        url: page.url(),
        title: state.title,
        filters: [] as ReturnType<typeof filterAgent.discoverAndInspectFilters> extends Promise<infer T> ? T : never[],
        listSections: [] as Awaited<ReturnType<typeof pageDomAgent.captureListSections>>,
        modals: [] as Parameters<typeof assertionAgent.generateAssertions>[0]['modals'],
        sidePanels: [] as Parameters<typeof assertionAgent.generateAssertions>[0]['sidePanels'],
        hasAlleFilterModal: config.hasAlleFilterModal,
        hasCreateModal: config.hasCreateModal,
        hasSidePanel: config.hasSidePanel,
      };
      const assertions = assertionAgent.generateAssertions(partial as Parameters<typeof assertionAgent.generateAssertions>[0]);
      console.log(`  Generated ${assertions.length} line(s) of test code:`);
      console.log('  ---');
      for (const line of assertions.slice(0, 40)) {
        console.log(`  ${line}`);
      }
      break;
    }

    case 'full': {
      const { runPageInspection } = await import('./agents/orchestratorAgent');
      const result = await runPageInspection(page, config, BASE_URL);
      reporterAgent.savePageReport(result);
      console.log(`  Full inspection complete: output/pages/${config.id}.md`);
      console.log(`  Filters: ${result.filters.length}, Sections: ${result.listSections.length}`);
      console.log(`  Modals: ${result.modals.length}, Side Panels: ${result.sidePanels.length}`);
      if (result.error) console.log(`  ERROR: ${result.error}`);
      break;
    }
  }
}

// ── Main loop ──────────────────────────────────────────────────────────────────

async function run(): Promise<void> {
  console.log('');
  console.log('  D2D App Inspector — Guided Mode');
  console.log(`  Target: ${BASE_URL}`);
  console.log('');

  if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.error(`  ERROR: Storage state not found at "${STORAGE_STATE_PATH}"`);
    console.error('  Please run "npm run login" first.');
    process.exit(1);
  }

  initOutputDirs();

  const browser: Browser = await chromium.launch({
    headless: false,
    slowMo: Number(process.env.SLOW_MO) || 0,
  });

  const context: BrowserContext = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
  });

  const page: Page = await context.newPage();

  await safeNavigate(page, BASE_URL);
  await page.waitForTimeout(2000);
  console.log('  Browser ready.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  printMenu();

  const ask = (): void => {
    rl.question('> ', async (input) => {
      const trimmed = input.trim();
      if (!trimmed) { ask(); return; }

      const target = parseTarget(trimmed);

      if (target.action === 'exit') {
        console.log('\n  Closing browser...');
        await browser.close();
        rl.close();
        process.exit(0);
      }

      if (target.action === 'menu') { printMenu(); ask(); return; }
      if (target.action === 'pages') { printPages(); ask(); return; }

      try {
        await handleAction(page, target);
      } catch (err) {
        console.log(`  ERROR: ${err}`);
      }

      ask();
    });
  };

  ask();
}

run().catch((err) => {
  console.error('Guided inspection failed:', err);
  process.exit(1);
});
