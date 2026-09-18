# Playwright + TypeScript — Best Practices & Framework Roadmap

Reference for this framework. Read when writing new tests, new page objects, or planning framework improvements.
All suggestions here require approval before implementation.

---

## Assertions — always use Playwright's built-in retry

```ts
// ✅ Auto-retries until timeout — correct
await expect(locator).toBeVisible()
await expect(locator).toBeEnabled()
await expect(locator).toHaveText('Hello')
await expect(locator).toHaveValue('input value')
await expect(locator).toHaveCount(3)
await expect(locator).toHaveAttribute('aria-pressed', 'true')
await expect(page).toHaveURL(/pattern/)
await expect(page).toHaveTitle(/pattern/)

// ❌ No retry — flaky on dynamic content
expect(await locator.isVisible()).toBe(true)
expect(await locator.textContent()).toBe('Hello')
expect(await locator.getAttribute('aria-pressed')).toBe('true')
```

---

## Locators — stability hierarchy

```ts
// 1. Stable id from testIds/ — always prefer
page.locator('#baulose-row-42')
page.locator('[data-entity-id="42"]')

// 2. Semantic role + name
page.getByRole('button', { name: /Erstellen/i })
page.getByRole('link', { name: /Baulose/i })
page.getByRole('dialog')

// 3. Label / placeholder — form fields
page.getByLabel('Email')
page.getByPlaceholder(/Suche in Aufgaben/i)

// 4. Visible text — static strings only
page.getByText('Abschlussgrund')

// ❌ Never
page.locator('.css-xyz123')
page.locator('//div[@class="table-row"]')
```

---

## Test structure — one action per step

```ts
test('creates a new regime', async ({ page }) => {
  const konfigPage = new KonfigurationPage(page)

  await test.step('navigate to Regime section', async () => {
    await konfigPage.goto()
    await konfigPage.openRegime()
  })

  await test.step('open create modal', async () => {
    await page.locator('#create-regime-button').click()
    await expect(page.locator('#create-regime-modal')).toBeVisible()
  })

  await test.step('fill and confirm', async () => {
    // fill fields...
    await page.locator('#create-regime-confirm-button').click()
  })

  await test.step('verify row appears in table', async () => {
    await expect(page.locator('[data-display-name="New Regime"]')).toBeVisible()
  })
})
```

---

## Page objects — composition rules

- One file per app section — `BaulosePage.ts`, `KonfigurationPage.ts`, etc.
- All extend `BasePage`
- Components (FilterBar, TableView, SidePanel, ModalDialog) are composed — never inherited
- `goto()` uses `door2doorRoutes` — never hardcoded strings
- `expectLoaded()` checks URL pattern + one visible landmark element
- No test logic inside page objects — page objects expose actions, specs make assertions

```ts
// ✅ CORRECT — page object exposes an action
async openCreateModal(): Promise<void> {
  await page.locator('#create-task-button').click()
}

// ❌ WRONG — assertion logic inside page object (belongs in spec)
async openCreateModal(): Promise<void> {
  await page.locator('#create-task-button').click()
  await expect(page.locator('#create-task-modal')).toBeVisible() // move to spec
}
```

---

## Anti-patterns — never do these

| Anti-pattern | Why | Fix |
|---|---|---|
| `page.waitForTimeout(2000)` | Race condition | `await expect(locator).toBeVisible()` |
| `test.only()` committed | Skips entire suite in CI | Remove before commit |
| Hardcoded route strings in specs | Breaks on URL changes | Use `door2doorRoutes.*` |
| Business logic in spec files | Wrong layer | Move to page object |
| `let page = null` in describe scope | Test order dependency | Init in `beforeEach` or fixture |
| `expect(true).toBe(true)` | Asserts nothing | Delete or replace |
| `.locator('button').last()` for context menu | Breaks if button count changes | Use `#stable-id-context-menu-button` |
| Multiple `test.describe` nesting > 2 levels | Hard to read | Flatten or split file |
| `console.log` left in test code | Noise in CI output | Remove before commit |

---

## Planned improvements (propose before implementing)

### High priority

**1. Central fixture file — `src/fixtures/index.ts`**

Wire all page objects through `test.extend()` so specs get clean dependency injection:

```ts
// src/fixtures/index.ts
import { test as base } from '@playwright/test'
import { BaulosePage } from '../pages/BaulosePage'
import { KonfigurationPage } from '../pages/KonfigurationPage'
// ... other page objects

type D2DFixtures = {
  baulosePage: BaulosePage
  konfigurationPage: KonfigurationPage
  // ...
}

export const test = base.extend<D2DFixtures>({
  baulosePage: async ({ page }, use) => use(new BaulosePage(page)),
  konfigurationPage: async ({ page }, use) => use(new KonfigurationPage(page)),
})

export { expect } from '@playwright/test'
```

Specs then become:
```ts
import { test, expect } from '../../src/fixtures'

test('baulose loads', async ({ baulosePage }) => {
  await baulosePage.gotoFTTHListSection()
  await baulosePage.expectLoadedFTTH()
})
```

**2. Move `door2doorRoutes` to `src/constants/routes.ts`**

`BasePage.ts` should not own route constants. Separate concerns:
```ts
// src/constants/routes.ts
export const door2doorRoutes = { ... } as const
// src/pages/BasePage.ts
import { door2doorRoutes } from '../constants/routes'
```

**3. `src/constants/testIds.ts` — mirror of frontend testIds/**

Avoids hardcoding ID strings in specs:
```ts
export const D2D_IDS = {
  baulose: {
    tableRow: (id: number | string) => `baulose-row-${id}`,
    quickFilter: {
      neubau: 'quick-filter-objectType-NEUBAU',
      ftth: 'quick-filter-objectType-FTTH',
      bestandsbau: 'quick-filter-objectType-BESTANDSBAU',
    },
    clearAllFilters: 'clear-all-applied-filters-button',
  },
  konfiguration: {
    regime: {
      tableRow: (id: number | string) => `regime-row-${id}`,
      contextMenuButton: (id: number | string) => `regime-${id}-context-menu-button`,
      createButton: 'create-regime-button',
      createModal: 'create-regime-modal',
      createCancelButton: 'create-regime-cancel-button',
      createConfirmButton: 'create-regime-confirm-button',
    },
    // ... other sections
  },
} as const
```

### Medium priority

**4. `src/helpers/` — shared test utilities**

```ts
// src/helpers/tableHelpers.ts
export async function waitForTableRow(page: Page, rowId: string): Promise<Locator> {
  const row = page.locator(`#${rowId}`)
  await expect(row).toBeVisible()
  return row
}

export async function getRowByDisplayName(page: Page, name: string): Promise<Locator> {
  return page.locator(`[data-display-name="${name}"]`)
}
```

**5. API setup helpers — `src/api/` client classes**

Use `api.fixture.ts` to create test data via API instead of clicking through UI. 10x faster tests.

```ts
// src/api/RegimeApiClient.ts
export class RegimeApiClient {
  constructor(private readonly api: APIRequestContext) {}

  async createRegime(data: CreateRegimeDto): Promise<Regime> {
    const response = await this.api.post('/api/regime', { data })
    expect(response.ok()).toBeTruthy()
    return response.json()
  }

  async deleteRegime(id: number): Promise<void> {
    await this.api.delete(`/api/regime/${id}`)
  }
}
```

**6. Test tags for suite filtering**

Add tags to every test so CI can run subsets:
```ts
test('verify baulose row appears @smoke @baulose', async ...)
test('create regime via modal @regression @konfiguration', async ...)

// Run only smoke tests in CI fast lane:
// playwright test --grep @smoke
```

### Lower priority (future)

**7. `playwright.config.ts` improvements**
- Add `screenshot: 'only-on-failure'` and `video: 'retain-on-failure'` to `use: {}`
- Add `reporter: [['html'], ['list']]` for both HTML report and live console output
- Add dedicated `api` project that depends only on `setup`, not `ui-preflight`

**8. Environment management**
- Add `.env.integration` and `.env.staging` alongside `.env`
- Use `dotenv-flow` or a `--project` env variable to switch targets
- Allows running the same tests against multiple environments

---

## Playwright version notes

Current version: `@playwright/test ^1.61.0`

Features available in 1.61+ that are useful for this framework:
- `expect(locator).toHaveAttribute()` with regex support
- `locator.and()` — chain locators for compound matching
- `locator.or()` — already used in BaulosePage tab locators (correct usage)
- `test.step()` with `{ box: true }` option — errors report at the step level in the HTML report

Check https://playwright.dev/docs/release-notes for new features when upgrading.
Always run `npm run typecheck` after a Playwright version upgrade — type signatures can change.
