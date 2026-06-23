import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const STORAGE_STATE_PATH = process.env.STORAGE_STATE_PATH || 'auth/storageState.json';

function waitForEnter(prompt: string): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

async function run(): Promise<void> {
  console.log('');
  console.log('=================================================================');
  console.log('  APP INSPECTION — LOGIN SETUP');
  console.log('=================================================================');
  console.log('');
  console.log(`  Target: ${BASE_URL}`);
  console.log('');

  const storageDir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: Number(process.env.SLOW_MO) || 0,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  console.log(`  Opening browser and navigating to: ${BASE_URL}`);
  console.log('');

  try {
    await page.goto(BASE_URL, { waitUntil: 'load', timeout: 30000 });
  } catch (err) {
    console.log(`  Warning: Initial navigation had an issue: ${err}`);
    console.log('  The browser is still open — you can navigate manually.');
  }

  console.log('=================================================================');
  console.log('');
  console.log('  ACTION REQUIRED:');
  console.log('');
  console.log('  1. The browser window is now open.');
  console.log('  2. Please log in to the application manually.');
  console.log('  3. Complete any MFA or 2FA steps if required.');
  console.log('  4. Wait until you are fully logged in and the application is loaded.');
  console.log('  5. Once you are logged in and the app is ready,');
  console.log('     come back here and press ENTER to continue.');
  console.log('');
  console.log('=================================================================');
  console.log('');

  await waitForEnter('  Press ENTER when login is complete: ');

  console.log('');
  console.log('  Saving authenticated storage state...');

  await context.storageState({ path: STORAGE_STATE_PATH });

  const currentUrl = page.url();
  console.log(`  Saved storage state to: ${STORAGE_STATE_PATH}`);
  console.log(`  Current URL after login: ${currentUrl}`);

  await browser.close();

  console.log('');
  console.log('=================================================================');
  console.log('  Login complete. Storage state saved.');
  console.log('');
  console.log('  Next step: run  npm run inspect');
  console.log('=================================================================');
  console.log('');
}

run().catch((err) => {
  console.error('Login setup failed:', err);
  process.exit(1);
});
