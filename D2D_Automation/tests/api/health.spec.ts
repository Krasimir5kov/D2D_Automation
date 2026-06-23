import { test, expect } from '../../src/fixtures/api.fixture';

// Scope: group authenticated API smoke tests.
test.describe('authenticated API smoke tests', () => {
  // Scope: verify that API tests can reuse the setup storageState cookies.
  test('calls the integration root endpoint with saved cookies', async ({ api }) => {
    // Scope: skip the example until the integration URL is configured.
    test.skip(!process.env.INTEGRATION_URL, 'Set INTEGRATION_URL in .env before running API tests.');

    // Scope: send a simple authenticated request that you can replace with a real API endpoint.
    const response = await api.get('/');

    // Scope: keep the example broad because different apps may return 200, 302, 401, or another app-specific code.
    expect(response.status()).toBeLessThan(500);
  });
});
