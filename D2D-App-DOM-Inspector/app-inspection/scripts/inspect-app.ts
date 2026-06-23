import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { initOutputDirs, screenshotPath, humanTimestamp } from '../helpers/filesystem';
import { safeNavigate } from '../helpers/safe-actions';
import { PAGES } from '../helpers/page-map';
import { runPageExploration, ExplorationSummary } from '../helpers/explorer';
import { outputPath, saveJson } from '../helpers/filesystem';

import { runPageInspection } from './agents/orchestratorAgent';
import { saveFullReport, saveInventories, saveTestSuggestions } from './agents/reporterAgent';
import { saveDiagrams } from './agents/flowDiagramAgent';
import { PageInspectionResult } from '../helpers/reporter';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const STORAGE_STATE_PATH = process.env.STORAGE_STATE_PATH || 'auth/storageState.json';

async function run(): Promise<void> {
  console.log('');
  console.log('=================================================================');
  console.log('  D2D APP INSPECTION — FULL RUN');
  console.log('=================================================================');
  console.log(`  Started: ${humanTimestamp()}`);
  console.log(`  Target:  ${BASE_URL}`);
  console.log(`  Auth:    ${STORAGE_STATE_PATH}`);
  console.log('=================================================================');
  console.log('');

  if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.error(`  ERROR: Storage state not found at "${STORAGE_STATE_PATH}"`);
    console.error('  Please run "npm run login" first.');
    process.exit(1);
  }

  initOutputDirs();

  const browser = await chromium.launch({
    headless: process.env.HEADLESS === 'true',
    slowMo: Number(process.env.SLOW_MO) || 0,
  });

  const context = await browser.newContext({
    storageState: STORAGE_STATE_PATH,
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  const results: PageInspectionResult[] = [];
  const explorations: ExplorationSummary[] = [];

  try {
    // Initial load and screenshot
    await safeNavigate(page, BASE_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: screenshotPath('app-initial-load'), fullPage: false });

    for (const config of PAGES) {
      // ── Phase 1: Structured inspection via agent pipeline ──────────────────
      const result = await runPageInspection(page, config, BASE_URL);
      results.push(result);

      // ── Phase 2: Full mouse exploration (click every safe interactive element) ──
      console.log(`\n[EXPLORE] Running full exploration on ${config.name}...`);
      const currentUrl = page.url();
      const urlIsOnPage =
        currentUrl.includes(config.path) ||
        currentUrl.includes(config.id);

      const explorationUrl = urlIsOnPage ? currentUrl : BASE_URL;
      const exploration = await runPageExploration(page, config.id, explorationUrl).catch((err) => {
        console.log(`  [EXPLORE] Exploration failed for ${config.name}: ${err}`);
        return null;
      });

      if (exploration) {
        explorations.push(exploration);
        console.log(
          `  [EXPLORE] ${config.name}: clicked ${exploration.clicked}/${exploration.totalFound}, ` +
          `changes detected: ${Object.entries(exploration.byChangeType)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => `${k}:${v}`)
            .join(', ')}`
        );
      }
    }

  } finally {
    await browser.close();
  }

  // ── Save all outputs ────────────────────────────────────────────────────────
  console.log('\n[SAVING] Generating final output files...');

  saveFullReport(results);
  saveInventories(results);
  saveTestSuggestions(results);
  saveDiagrams(results);

  if (explorations.length > 0) {
    saveJson(outputPath('data', 'exploration-index.json'), {
      generatedAt: humanTimestamp(),
      pages: explorations.map((e) => ({
        pageId: e.pageId,
        totalFound: e.totalFound,
        clicked: e.clicked,
        skipped: e.skipped,
        errors: e.errors,
        byChangeType: e.byChangeType,
      })),
    });
  }

  const errorCount = results.filter((r) => r.error).length;

  console.log('');
  console.log('=================================================================');
  console.log('  INSPECTION COMPLETE');
  console.log('=================================================================');
  console.log(`  Finished:       ${humanTimestamp()}`);
  console.log(`  Pages:          ${results.length}`);
  console.log(`  Errors:         ${errorCount}`);
  console.log(`  Explorations:   ${explorations.length}`);
  console.log('');
  console.log('  Output:');
  console.log('    output/reports/full-inspection-report.md');
  console.log('    output/pages/*.md');
  console.log('    output/data/*.json');
  console.log('    output/flows/*.mmd');
  console.log('    output/screenshots/*.png');
  console.log('    output/dom/*.html');
  console.log('    output/accessibility/*.txt');
  console.log('    output/explorations/{page}/{element}/');
  console.log('    output/test-suggestions/suggested-playwright-tests.md');
  console.log('=================================================================');
}

run().catch((err) => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
