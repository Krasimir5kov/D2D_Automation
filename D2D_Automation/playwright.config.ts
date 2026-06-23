import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { AUTH_FILE } from './src/constants/auth';

// Scope: load local environment values from .env before Playwright reads the config.
dotenv.config({ quiet: true });

// Scope: define the Playwright projects and shared test behavior for this framework.
export default defineConfig({
  // Scope: keep all test files under the tests folder.
  testDir: './tests',

  // Scope: allow Playwright to run independent tests in parallel.
  fullyParallel: true,

  // Scope: fail CI if test.only is accidentally committed.
  forbidOnly: !!process.env.CI,

  // Scope: retry only on CI by default, just like the standard Playwright template.
  retries: process.env.CI ? 2 : 0,

  // Scope: use fewer workers on CI to reduce flakiness from shared environments.
  workers: process.env.CI ? 1 : undefined,
  
  // Scope: keep the default HTML report for local debugging.
  reporter: 'html',

  // Scope: configure options shared by all projects unless a project overrides them.
  use: {
    // Scope: base URL comes from .env so the same tests can target integration or another environment.
    baseURL: process.env.INTEGRATION_URL,

    // Scope: collect traces on retries so failed tests are easier to debug.
    trace: 'on-first-retry',
  },

  // Scope: keep setup first, then make every normal test project depend on the saved login state.
  projects: [
    {
      // Scope: this project opens Chrome in headed mode for manual username, password, and two-factor login.
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        headless: false,
      },
    },
    {
      // Scope: this is the only active browser pvroject for now, as requested.
      name: 'chrome',
      dependencies: ['setup'],
      testIgnore: /.*\.setup\.ts/,
      use: {  
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: AUTH_FILE,
        headless: false,
      },
    },

    // Scope: standard Playwright examples kept commented for later use.
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },

    // Scope: standard Playwright examples kept commented for later use.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // Scope: standard Playwright examples kept commented for later use.
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // Scope: standard Playwright mobile examples kept commented for later use.
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },

    // Scope: standard Playwright mobile examples kept commented for later use.
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    // Scope: standard Playwright branded-browser examples kept commented for later use.
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },

    // Scope: standard Playwright branded-browser examples kept commented for later use.
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  // Scope: standard Playwright webServer example kept commented for later use.
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
