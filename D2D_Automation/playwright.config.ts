import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { AUTH_FILE } from './src/constants/auth';
import path from 'path';


// Scope: load local environment values from .env before Playwright reads the config.
//dotenv.config({ quiet: true });
dotenv.config({
  path: path.resolve(__dirname, '.env'),
  quiet: true,
});

// Scope: define the Playwright projects and shared test behavior for this framework.
export default defineConfig({
  // Scope: keep all test files under the tests folder.
  testDir: './tests',
  // testMatch: /.*\.spec\.ts/,           // Glob/regex for which files count as tests (default already matches *.spec.ts)
  // testIgnore: /.*\.skip\.ts/,          // Glob/regex for files to skip entirely
  // outputDir: './test-results',        // Where traces/screenshots/videos for failed tests get written (this is already the default name)
  // snapshotDir: './__snapshots__',     // Where toMatchSnapshot() baseline images live
  // snapshotPathTemplate: '{snapshotDir}/{testFilePath}/{arg}{ext}', // Customize snapshot file naming

  // Scope: allow Playwright to run independent tests in parallel.
  fullyParallel: true,

  // Scope: fail CI if test.only is accidentally committed.
  forbidOnly: !!process.env.CI,
  // maxFailures: process.env.CI ? 10 : undefined, // Stop the whole run early after N failures (fail fast)
  // preserveOutput: 'failures-only',    // 'always' | 'never' | 'failures-only' — whether to keep outputDir artifacts for passed tests
  // quiet: false,                       // Suppress stdout/stderr from tests when true
  // updateSnapshots: 'missing',         // 'all' | 'none' | 'missing' — control --update-snapshots behavior from config

  // Scope: retry only on CI by default, just like the standard Playwright template.
  retries: process.env.CI ? 2 : 2,
  timeout: 60_000,                    // Per-test timeout in ms (default is 30s) — raise for slow real environments
  globalTimeout: 60 * 60 * 1000,      // Hard cap in ms for the ENTIRE test run across all tests/workers
  expect: { timeout: 60_000 },         // Default timeout for each individual expect() web-first assertion (default 5s)
  // reportSlowTests: { max: 5, threshold: 15_000 }, // Flag the N slowest test files over a threshold in the report

  // Scope: use fewer workers on CI to reduce flakiness from shared environments.
  workers: process.env.CI ? 1 : undefined,
  // shard: { total: 4, current: 1 },    // Split the suite across N machines (CI matrix) — this machine runs shard 1 of 4

  // Scope: keep the default HTML report for local debugging.
  reporter: 'html',
  // reporter: 'list',                   // Simple line-per-test console output
  // reporter: 'dot',                    // One dot per test — compact CI-friendly output
  // reporter: 'line',                   // Single line, overwritten per test
  // reporter: 'json',                   // Machine-readable results (or ['json', { outputFile: 'results.json' }])
  // reporter: 'junit',                  // JUnit XML — for Jenkins/other CI dashboards
  // reporter: 'github',                 // Annotates failures directly on GitHub PR diffs
  // reporter: 'blob',                   // Merge-friendly format for sharded CI runs (playwright merge-reports)
  // reporter: 'markdown',               // Markdown summary, handy for posting into Slack/Jira
  // reporter: [['html'], ['junit', { outputFile: 'results.xml' }]], // Multiple reporters at once — array form
  // grep: /@Admin/,                     // Only run tests whose title matches this pattern (same as --grep CLI flag)
  // grepInvert: /@wip/,                 // Exclude tests matching this pattern
  // metadata: { environment: 'integration' }, // Free-form key/values attached to the HTML report

  // Scope: configure options shared by all projects unless a project overrides them.
  use: {
    // Scope: base URL comes from .env so the same tests can target integration or another environment.
    baseURL: process.env.INTEGRATION_URL,

    // Scope: collect traces on retries so failed tests are easier to debug.
   // trace: 'on-first-retry',
    // trace: 'on',                      // Always record a trace (heavier, but max debuggability)
    trace: 'retain-on-failure',       // Record every test, but only keep the file if it failed

    // actionTimeout: 10_000,            // Timeout for individual actions like click()/fill() (default: no limit, falls back to test timeout)
    navigationTimeout: 60_000,        // Timeout for page.goto()/waitForNavigation() specifically — useful for this slow remote INT server

    screenshot: 'only-on-failure',    // Auto-capture a screenshot when a test fails
    // screenshot: 'on',                 // Screenshot after every test, pass or fail
   video: 'retain-on-failure',       // Record video, keep only for failed tests
    // video: 'on',                      // Always record video (heavy — mainly for deep debugging sessions)

    // viewport: { width: 1920, height: 1080 }, // Browser window size for every test
    // ignoreHTTPSErrors: true,          // Skip TLS cert validation — useful for self-signed INT/staging certs
    // extraHTTPHeaders: { 'X-Custom': 'value' }, // Extra headers sent with every request (e.g. a feature-flag header)
    // locale: 'de-AT',                  // Browser locale — this app is German-language, could stabilize date/number formatting
    // timezoneId: 'Europe/Vienna',      // Fixes the browser's timezone so date-dependent assertions are deterministic
    // colorScheme: 'dark',              // Force dark/light mode ('light' | 'dark' | 'no-preference')
    // userAgent: 'custom-agent-string',
    // permissions: ['geolocation', 'notifications'], // Auto-grant browser permission prompts
    // geolocation: { latitude: 48.2, longitude: 16.37 }, // Mock GPS location (Vienna)
    // offline: false,                   // Simulate no network connection
    // acceptDownloads: true,            // Allow file downloads during tests (e.g. testing the Imports export flow)
    // bypassCSP: true,                  // Bypass Content-Security-Policy — sometimes needed to inject scripts for testing
    // javaScriptEnabled: true,          // Disable to test no-JS fallback behavior
    // deviceScaleFactor: 2,             // Simulate a Retina/HiDPI display
    // httpCredentials: { username: 'user', password: 'pass' }, // For pages behind HTTP Basic Auth
    // proxy: { server: 'http://myproxy:3128' }, // Route browser traffic through a proxy
    // launchOptions: { slowMo: 250 },   // Slow down every action by N ms — handy while watching a test run live
    // contextOptions: { recordVideo: { dir: 'videos/' } }, // Advanced per-context overrides
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
        headless: true,
      },
    },
    {
      // Scope: this project opens Chrome in headed mode for manual username, password, and two-factor login.
      name: 'ui-preflight',
      dependencies: ['setup'],
      testMatch: /preflight\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: AUTH_FILE,
        headless: true,
      },
    },
    {
      // Scope: this is the only active browser pvroject for now, as requested.
      name: 'chrome',
      dependencies: ['ui-preflight'],
      testIgnore: [/.*\.setup\.ts/, /preflight\/.*\.spec\.ts/],
      // timeout: 45_000,               // Per-project override of the top-level test timeout — e.g. give this slower remote env more room
      // retries: 1,                    // Per-project override of the top-level retries setting
      // repeatEach: 2,                 // Run every test in this project N times back-to-back (flake-hunting)
      // metadata: { section: 'chrome-e2e' }, // Per-project metadata shown in the HTML report
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: AUTH_FILE,
        headless: true,
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
  // Starts a local dev server before tests run and tears it down after — not needed here
  // since this framework targets a real remote INTEGRATION_URL, not a locally-built app.
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120_000,                // How long to wait for the server to become ready
  //   env: { NODE_ENV: 'test' },       // Extra env vars passed to the spawned server process
  //   stdout: 'pipe',                  // 'pipe' | 'ignore' — surface the server's own console output
  // },

  // globalSetup: require.resolve('./global-setup'),    // Runs once before ALL tests/projects — e.g. seed test data via API
  // globalTeardown: require.resolve('./global-teardown'), // Runs once after ALL tests finish — e.g. clean up seeded data
  // ignoreSnapshots: false,             // Skip all toMatchSnapshot()/toHaveScreenshot() comparisons entirely
});
