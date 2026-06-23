import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

export default defineConfig({
  testDir: './scripts',
  timeout: Number(process.env.DEFAULT_TIMEOUT) || 30000,
  use: {
    baseURL: process.env.BASE_URL,
    headless: process.env.HEADLESS === 'true',
    slowMo: Number(process.env.SLOW_MO) || 0,
    storageState: path.resolve('auth/storageState.json'),
    screenshot: 'on',
    video: 'off',
    viewport: { width: 1440, height: 900 },
  },
  reporter: [['list']],
  projects: [
    {
      name: 'chromium',
      use: { channel: 'chromium' },
    },
  ],
});
