# D2D Automation

Basic Playwright + TypeScript automation framework for UI and API testing with Chrome.

## Structure

```text
playwright.config.ts        Playwright projects, Chrome setup, shared config
src/constants/auth.ts       Shared auth storage paths
src/fixtures/api.fixture.ts Authenticated API request fixture
src/pages/HomePage.ts       Example UI page object
tests/setup/auth.setup.ts   Manual login and two-factor setup project
tests/ui/home.spec.ts       Example authenticated UI test
tests/api/health.spec.ts    Example authenticated API test
```

## First Run

1. Copy `.env.example` to `.env`.
2. Set `INTEGRATION_URL` to your integration application URL.
3. Run `npm run auth:setup`.
4. Chrome opens. Enter your username, password, and complete both 2FA steps manually.
5. Press Enter in the terminal when the application is logged in.
6. Run `npm test`, `npm run test:ui`, or `npm run test:api`.

## Auth Refresh

Run `npm run auth:clear` and then `npm run auth:setup` when the saved cookies expire.
