# D2D Automation — AI Assistant Instructions

## ⚠️ Approval gate (mandatory)
Never apply any change to an existing source file without explicit approval from the user.
Always propose the change first, wait for "yes" or "apply it", then act.
New files may be drafted and shown, but must also be confirmed before being written to disk.

---

## Project overview

| Item | Value |
|---|---|
| App | Door2Door (D2D) — React SPA, hash-based routing |
| Stack | Playwright + TypeScript, Node 18+, strict mode on |
| Auth | Manual 2FA via `tests/setup/auth.setup.ts`, storageState reuse |
| Base URL env var | `INTEGRATION_URL` in `.env` |
| Auth state path | `playwright/.auth/user.json` (constant in `src/constants/auth.ts`) |
| Route constants | `door2doorRoutes` in `src/pages/BasePage.ts` |
| Stable HTML IDs | All in `src/frontend/shared/testIds/` (frontend repo) |
| ID reference doc | `D2D_QA_Attributes_Work_Summary.md` (project root) |
| ID reference (automation) | `references/testids-map.md` |
| Architecture decisions | `references/decisions.md` |

---

## Route access rules — critical

Routes are a **nested object**. Always use the full nested path. Flat keys do not exist and return `undefined` silently.

```ts
// ✅ CORRECT
door2doorRoutes.baulose.ftth
door2doorRoutes.baulose.bestandsbau
door2doorRoutes.objekte.neubau
door2doorRoutes.objekte.ftth
door2doorRoutes.objekte.bestandsbau
door2doorRoutes.salesActions.neubau
door2doorRoutes.salesActions.ftth
door2doorRoutes.salesActions.bestandsbau
door2doorRoutes.benutzerverwaltung.users
door2doorRoutes.benutzerverwaltung.teams
door2doorRoutes.benutzerverwaltung.organisationen
door2doorRoutes.importe                        // flat string — correct, not nested
door2doorRoutes.konfiguration.overview
door2doorRoutes.konfiguration.abschlussgruende
door2doorRoutes.konfiguration.aufgaben
door2doorRoutes.konfiguration.gruppen
door2doorRoutes.konfiguration.regime
door2doorRoutes.konfiguration.aktivitaetenSetup

// ❌ WRONG — these flat keys do not exist
door2doorRoutes.objekteNeubau
door2doorRoutes.salesActionsNeubau
door2doorRoutes.benutzerverwaltungUsers
door2doorRoutes.konfigurationOverview
```

---

## Component constructor signatures — critical

### SidePanel — requires 3 arguments
```ts
// Constructor: (page: Page, testId: string, closeButton: Locator)

// ✅ CORRECT
new SidePanel(page, 'object-panel-neubau', page.locator('#object-panel-neubau-close-button'))

// ❌ WRONG — missing testId and closeButton
new SidePanel(page)
```

### FilterBar — correct method name
```ts
// ✅ CORRECT
await this.filters.openAllFiltersInAlleFilterModal()

// ❌ WRONG — method does not exist
await this.filters.openAllFilters()
```

---

## Locator priority (enforce this order)

| Priority | Pattern | When to use |
|---|---|---|
| 1 | `page.locator('#stable-id')` | ID from `testIds/` attribute work (POSS-3402+) |
| 2 | `page.locator('[data-entity-id="..."]')` | data-* attributes from rowAttributes |
| 3 | `page.getByRole('button', { name })` | Semantic HTML, action buttons |
| 4 | `page.getByLabel()` / `page.getByPlaceholder()` | Form fields |
| 5 | `page.getByText()` | Static visible text, last resort |
| ❌ | `page.locator('.css-class')` | Never — breaks on style changes |
| ❌ | `page.locator('//xpath')` | Never |

---

## Assertion rules

```ts
// ✅ CORRECT — Playwright auto-retry, waits for state
await expect(locator).toBeVisible()
await expect(locator).toHaveText('Hello')
await expect(locator).toBeEnabled()
await expect(page).toHaveURL(/pattern/)

// ❌ WRONG — no retry, flaky on dynamic content
expect(await locator.isVisible()).toBe(true)
expect(await locator.textContent()).toBe('Hello')
```

---

## Architecture rules

- All page objects extend `BasePage` — never call `page.goto()` directly inside specs
- Never instantiate page objects with `let` in `describe` scope mutated per test — use `beforeEach` or fixtures
- Never use `page.waitForTimeout()` — use `await expect(locator).toBeVisible()` or `waitFor({ state })`
- Never modify shared or GuCCI library components — wrap with `div`/`span` instead
- Never commit `test.only()` without a comment explaining why

---

## Framework folder map

```
src/
  components/         Reusable UI helpers (FilterBar, TableView, SidePanel, ModalDialog, SearchField, AppNavigation, KonfigurationSideBar)
  constants/          auth.ts — AUTH_FILE, AUTH_DIR, timeout constant
  fixtures/           api.fixture.ts — authenticated APIRequestContext
  pages/              One file per app section, all extend BasePage
    BasePage.ts       door2doorRoutes + buildDoor2DoorUrl + gotoDoor2DoorRoute
    index.ts          Barrel re-exports for all page objects
tests/
  setup/              auth.setup.ts — manual 2FA login, saves storageState
  preflight/          preflight.spec.ts — smoke: app mounts with saved auth
  ui/                 Feature specs (UI)
  api/                Feature specs (API)
references/
  testids-map.md      Stable HTML IDs from POSS-3402 → POSS-3422 attribute work
  decisions.md        Architecture decisions log
```

---

## Playwright config — project dependency chain

```
setup → ui-preflight → chrome (UI tests)
setup → api (API tests — separate project, no browser)
```

The `api` project does not depend on `ui-preflight`. Keep them independent.

---

## Known issues to fix before next test run

1. `BenutzerverwaltungPage.goto()` — uses `door2doorRoutes.benutzerverwaltungUsers` (wrong flat key)
2. `ObjektePage.goto()` — uses `door2doorRoutes.objekteNeubau` (wrong flat key)
3. `SalesActionsPage.goto()` — uses `door2doorRoutes.salesActionsNeubau` (wrong flat key)
4. `KonfigurationPage.goto()` — uses `door2doorRoutes.konfigurationOverview` (wrong flat key)
5. `BenutzerverwaltungPage`, `ObjektePage`, `SalesActionsPage` — `new SidePanel(page)` missing 2 required args
6. `ObjektePage.openAllFilters()`, `SalesActionsPage.openAllFilters()` — call non-existent `openAllFilters()` method
7. `SalesActionsPage` — `searchInput` uses `#objects-search-field` (Objekte ID, wrong copy-paste)
8. `bauloseListSectionView.spec.ts` — incomplete expression `const orgFilter = await baulosePage.` (syntax error)
9. `SidePanel.ts` — dead import `import { strict } from 'assert'`
