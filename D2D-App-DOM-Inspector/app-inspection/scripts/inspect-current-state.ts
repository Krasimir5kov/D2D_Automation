import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

import {
  initOutputDirs,
  outputPath,
  screenshotPath,
  domPath,
  accessibilityPath,
  saveText,
  saveJson,
  humanTimestamp,
  sanitizeFilename,
} from '../helpers/filesystem';

import {
  captureMainContentDom,
  captureAccessibilitySnapshot,
  collectAllPageElements,
  cleanHtml,
} from '../helpers/dom-capture';

import { safeNavigate } from '../helpers/safe-actions';
import { classifyButton } from '../helpers/safe-actions';
import { generateLocatorSuggestions } from '../helpers/reporter';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const STORAGE_STATE_PATH = process.env.STORAGE_STATE_PATH || 'auth/storageState.json';

async function run(): Promise<void> {
  console.log('');
  console.log('=================================================================');
  console.log('  APP INSPECTION — CURRENT STATE SNAPSHOT');
  console.log('=================================================================');
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Time:   ${humanTimestamp()}`);
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

  try {
    console.log(`  Navigating to: ${BASE_URL}`);
    await safeNavigate(page, BASE_URL);
    await page.waitForTimeout(2000);

    const url = page.url();
    const title = await page.title();
    const ts = sanitizeFilename(humanTimestamp());

    console.log(`  Current URL:   ${url}`);
    console.log(`  Page title:    ${title}`);
    console.log('');

    // Screenshot
    const ssPath = screenshotPath(`current-state-${ts}`);
    await page.screenshot({ path: ssPath, fullPage: false });
    console.log(`  Screenshot:    ${ssPath}`);

    // DOM
    const rawDom = await captureMainContentDom(page);
    const cleanedDom = cleanHtml(rawDom);
    const dPath = domPath(`current-state-${ts}`);
    const { saveHtml } = await import('../helpers/filesystem');
    saveHtml(dPath, cleanedDom);
    console.log(`  DOM:           ${dPath}`);

    // Accessibility
    const a11y = await captureAccessibilitySnapshot(page);
    const aPath = accessibilityPath(`current-state-${ts}`);
    saveText(aPath, a11y);
    console.log(`  Accessibility: ${aPath}`);

    // Elements
    const elements = await collectAllPageElements(page);

    const buttonsWithSafety = elements.buttons.map((b) => ({
      ...b,
      safetyClass: classifyButton(b.text, b.ariaLabel),
    }));

    const locators = generateLocatorSuggestions(elements.buttons, 'current-state');

    // Report
    const report: Record<string, unknown> = {
      url,
      title,
      timestamp: humanTimestamp(),
      screenshotPath: ssPath,
      domPath: dPath,
      a11yPath: aPath,
      buttons: buttonsWithSafety,
      links: elements.links.slice(0, 50),
      inputs: elements.inputs,
      selects: elements.selects,
      checkboxes: elements.checkboxes,
      tabs: elements.tabs,
      locatorSuggestions: locators,
    };

    const reportPath = outputPath('data', `current-state-${ts}.json`);
    saveJson(reportPath, report);
    console.log(`  Report JSON:   ${reportPath}`);

    // Markdown summary
    const mdLines: string[] = [
      `# Current State Snapshot`,
      `**URL:** \`${url}\``,
      `**Title:** ${title}`,
      `**Captured:** ${humanTimestamp()}`,
      '',
      `## Elements Found`,
      `- Buttons: ${elements.buttons.length}`,
      `- Links: ${elements.links.length}`,
      `- Inputs: ${elements.inputs.length}`,
      `- Selects: ${elements.selects.length}`,
      `- Checkboxes: ${elements.checkboxes.length}`,
      `- Tabs: ${elements.tabs.length}`,
      '',
      `## Buttons (with safety classification)`,
      ...buttonsWithSafety.slice(0, 30).map((b) => `- \`${b.text || b.ariaLabel || '(no label)'}\` — ${b.safetyClass}`),
      '',
      `## Inputs`,
      ...elements.inputs.slice(0, 20).map((i) => `- \`${i.placeholder || i.ariaLabel || i.name || '(no label)'}\` (type: ${i.type || 'text'})`),
      '',
      `## Suggested Locators`,
      ...locators.slice(0, 10).flatMap((l) => [
        `### ${l.element}`,
        `\`\`\`typescript`,
        l.locator,
        `\`\`\``,
        `- ${l.strategy} | ${l.stability} — *${l.notes}*`,
        '',
      ]),
    ];

    const mdPath = outputPath('pages', `current-state-${ts}.md`);
    saveText(mdPath, mdLines.join('\n'));
    console.log(`  Markdown:      ${mdPath}`);

  } finally {
    await browser.close();
  }

  console.log('');
  console.log('=================================================================');
  console.log('  Current state snapshot complete.');
  console.log('=================================================================');
  console.log('');
}

run().catch((err) => {
  console.error('Snapshot failed:', err);
  process.exit(1);
});
