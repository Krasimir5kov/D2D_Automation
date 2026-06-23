import { request, test as base, expect, type APIRequestContext } from '@playwright/test';
import { AUTH_FILE } from '../constants/auth';

// Scope: describe the custom fixtures that API tests can use.
type ApiFixtures = {
  api: APIRequestContext;
};

// Scope: extend Playwright with an authenticated API request context.
export const test = base.extend<ApiFixtures>({
  // Scope: create one API client per test and load the same cookies saved by the setup project.
  api: async ({}, use) => {
    // Scope: build the request context with the integration base URL and storage state cookies.
    const api = await request.newContext({
      baseURL: process.env.INTEGRATION_URL,
      storageState: AUTH_FILE,
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
    });

    // Scope: make the authenticated API client available to the current test.
    await use(api);

    // Scope: release network resources after the current test has finished.
    await api.dispose();
  },
});

// Scope: re-export expect so API tests import everything from one place.
export { expect };
