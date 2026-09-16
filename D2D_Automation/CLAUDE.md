# D2D Automation — AI Assistant Instructions

This file is read automatically at the start of every Claude Code session opened in this
repo, on **any** machine. It exists so that context built up on one computer (rules agreed,
decisions made, current progress) isn't lost when the user switches to a different laptop —
everything below used to live only in this assistant's local, per-machine memory and has been
consolidated here on purpose. Keep it up to date as things change; it is meant to be edited,
not just read.

## ⚠️ Approval gate (mandatory)
Never apply any change to an existing source file without explicit approval from the user.
Always propose the change first, wait for "yes" or "apply it", then act.
New files may be drafted and shown, but must also be confirmed before being written to disk.

---

## ⚠️ Record everything, as it happens (mandatory)
After the user asks you to apply *any* change — a commit, a push, a new test, a new POM
method/locator, a new helper, a new decision, a new agreement about how something should work, a
compromise/exception against a rule stated here, a bug found, an environment quirk discovered —
write it down before considering the turn finished. Don't wait for a dedicated "update your
notes" request; treat recording as part of doing the work, the same way running `npm run
typecheck` after an edit is part of doing the work.

- **Where: this file (`CLAUDE.md`) is the only place that's guaranteed to reach both laptops.**
  Write the fact here, in the relevant section (`Known bugs, decisions, and status`,
  `Open loose ends`, the filter-coverage status paragraph, etc.), in the *same* turn the
  underlying change happens — not in a later cleanup pass, and not *only* in the local memory
  system. Local, per-machine memory (`~/.claude/projects/.../memory/`) lives on whichever laptop
  the session happens to be running on and does **not** sync anywhere — a fact written only
  there is invisible on the other laptop after a `git pull`, full stop. It's fine to also note
  something in memory for this session's own quick recall, but that is never a substitute for
  writing it here — if a fact matters enough to remember next time, on either machine, it goes
  in `CLAUDE.md`, no exceptions. If a session ever finds this file and local memory disagree,
  fix them to match in that same turn rather than picking one silently.
- **What counts:** not just "what changed" (git history already has that) but *why* — the
  reasoning, the alternative that was rejected and why, the environment behavior that isn't
  obvious from reading the code. The Objekte Neubau sort-performance timeout is the reference
  example: the code alone shows a `test.skip()`, but only a written note explains *why* it's
  skipped (a confirmed backend bug, Jira-filed, INT-specific — not generic flakiness, not a
  locator problem) and what condition should make someone remove the skip. Any new bug,
  compromise, or non-obvious decision should get the same treatment.
- **Precision matters more than speed here.** Don't guess or assume a status — if something
  looks like it changed (a `test.skip()` got commented out, a helper got renamed) but the reason
  isn't confirmed from the code or conversation alone, write down what was actually observed and
  flag it as unconfirmed rather than asserting it as resolved.

---

## How to communicate with this user

- **User:** Krasimir Petkov — QA Manual/Automation Engineer, native Bulgarian speaker,
  self-identifies as a beginner QA SDET deliberately building this framework to learn it.
- **Bilingual responses (mandatory, every response):** add a Bulgarian translation in
  parentheses immediately after every English sentence — prose only, never inside code blocks,
  file paths, terminal commands, or variable/identifier names. This has now dropped 4+ times
  confirmed, including at least once *after* this exact rule was already sitting in this file
  (auto-loaded every session) — so simply having the rule in context is proven NOT sufficient on
  its own. It specifically fails after long, fast, tool-call-heavy stretches of a session (lots
  of file reads/edits, rapid debugging). The only mitigation that matters: treat it as an active
  per-response gate, checked at the moment of drafting each reply, not a fact to have read once.
  If a drafted response has zero Bulgarian parentheticals anywhere in it, that itself is the
  signal something has drifted — fix it before sending, regardless of how short,
  mechanical, or code-focused the reply feels.
- **Present both a beginner option and a pro option.** When there's more than one valid way to
  do something (e.g. `test.beforeEach()` vs. a custom Playwright fixture for page-object
  instantiation), explicitly name the simple/beginner-expected approach *and* the more advanced
  one, and say which is which — don't default to silently showing only the most sophisticated
  answer. The user engages comfortably with advanced concepts already, but wants to consciously
  choose the level-up rather than only ever see it.
- **When asked whether something already written is correct** ("is this right?", "did I write
  this correctly?"): give reasoning, not just a verdict. State whether it's correct, then explain
  *why* by pointing to the specific rule/convention below it does or doesn't follow (which layer
  it belongs in, locator priority, assertion style, naming convention, etc.) and the specific
  line/pattern that triggered the judgment — never answer with a bare yes/no, and never silently
  rewrite it without first explaining what was wrong.
- **For Objekte-page work specifically** (`ObjektePage.ts`, Objekte's `FilterBar.ts` usage,
  `filterAssertions.ts` helpers used by Objekte specs, `tests/ui/objekte/**`): default to
  teach-and-review, not write-for-them. Explain what's wrong and the shape of the fix in words;
  let the user write the actual code. Only produce complete, ready-to-paste code when they
  explicitly say "write it" / "apply it" / equivalent. This is a deliberate learning choice for
  this one page, not just the general approval-gate rule — other pages don't have this same
  "user writes it themselves" arrangement.
- This project runs fully standalone in its own container — **never** add an actual import,
  relative path, or build dependency from `D2D_Automation` into the FE (`microfrontend-door2door-main`)
  or BE (`microservice-door2door`) source repos, even though reading those repos (when
  available) is a legitimate way to learn real DOM/ids/network behavior. Any id/selector
  knowledge learned that way gets hardcoded/mirrored as plain string constants in
  `src/constants/*.ts` — never imported live from another repo.

---

## Testing conventions

### Page Object Model — four buckets only
Follow official Playwright POM style. Never use a `get` accessor for a fixed locator.

| What | How |
|---|---|
| Component/helper instance created with `new` | `readonly` property, assigned in constructor |
| Fixed locator (no parameter needed) | `readonly Locator`, assigned in constructor |
| Dynamic locator (needs a parameter) | plain method returning `Locator` |
| User action | `async` method |

```ts
export class AppNavigation {
  readonly bauloseLink: Locator;       // fixed locator → readonly

  constructor(private readonly page: Page) {
    this.bauloseLink = page.getByRole('link', { name: /^Baulose$/i });
  }

  async goToBaulose(): Promise<void> { // action → async method
    await this.bauloseLink.click();
  }
}
```

### Framework layers — one responsibility per layer (SOLID-style)
Every piece of code in this framework belongs to exactly one of these layers. Each layer has
one job; putting a layer's job in the wrong file is the single most common review finding in
this project. When reviewing or writing anything, name which layer it's in and check it's only
doing that layer's job.

| Layer | Where | Owns | Never contains |
|---|---|---|---|
| **Page Objects** | `src/pages/*.ts` | Locators (readonly for fixed, method for dynamic) + user actions (click, fill, navigate) + one narrow `expectLoadedX()` readiness check per page/section | Business assertions, filter-result correctness checks |
| **Components** | `src/components/*.ts` | Same as Page Objects, but for UI pieces shared *across* pages (`FilterBar`, `TableView`, `SidePanel`, `ModalDialog`, `SearchField`, `AppNavigation`) — narrow structural checks about the widget itself (e.g. `expectDropdownOpened()` confirming the portal isn't empty) are fine, business-outcome checks are not | Page-specific locators, business assertions |
| **Action helpers** | `src/helpers/filterHelpers.ts` | Actions only, composed from Page Object/Component calls into a reusable flow (e.g. `selectFilterChoiceExpandingAllOptions`) | Any `expect()` call at all |
| **Assertion helpers** | `src/helpers/filterAssertions.ts` | Business-correctness assertions, every export prefixed `expect...`; may internally handle cross-cutting technical concerns (settle-waiting, stuck-loading recovery) since those aren't business decisions | Business *decisions* about what a test should check — that's the spec's call, not the helper's |
| **Fixtures** | `src/fixtures/*.ts` | Dependency injection — hands specs ready-to-use, authenticated page objects via `test.extend()` | Test logic |
| **Specs** | `tests/ui/**/*.spec.ts` | The actual business assertions, `test.step` narration, orchestration of calls into every layer above | Raw `page.locator(...)` calls, inline retry/recovery logic, `new XPage(page)` construction (use the fixture) |

**How this plays out concretely:**
- A Page Object method like `openCreateModal()` clicks a button — it does not also assert the
  modal opened; that `expect()` belongs in the spec (or, if repeated across many specs, in an
  assertion helper called from the spec).
- `filterHelpers.ts` and `filterAssertions.ts` are deliberately two separate files, not one,
  specifically so a glance at the import line tells you whether a function can throw a test
  failure or not.
- A recovery/retry mechanism (`gotoWithRetry`, `expectWithRecovery`, the "Too Many Requests"
  locator handler) lives once, in `BasePage.ts`, and every layer above just calls it — never
  reimplement retry/wait logic inline in a spec or a one-off helper.

### Filter test coverage — three separate concerns, three separate files per filter
For every filter on every page, split coverage into three dedicated spec files rather than one
combined one:
1. **Availability** — `{page}FiltersAvailability.spec.ts`, one file per *page* covering every
   filter on it: is the closed trigger visible with the right title.
2. **Dropdown Content** — `{page}{FilterName}FilterDropdown.spec.ts`, one file per *filter*:
   once opened, search-input presence/placeholder, header label, counter-badge behavior on
   selecting an option.
3. **Apply** — `{page}{FilterName}FilterApply.spec.ts`, one file per filter: select a value,
   apply it, verify the list results/chip/criteria.

**Scaffold all three immediately when a new page's filter list is confirmed** — one
`test.describe.skip(...)` stub per filter, named consistently, with a header comment naming the
trigger locator — *before* writing any real test logic and without waiting to be asked
filter-by-filter. This has been corrected once already (only the first filter got a stub file
the first time a new page started); don't repeat that.

### Reusable filter-testing infrastructure (already built — reuse, don't rebuild)
- `FilterBar.ts` — generic, page-agnostic: `trigger(id)`, `choiceLabelButton(label)`,
  `choiceCheckbox(label)`, `choiceRadio(label)`, `filterBarChip(text)`,
  `filterBarChipPlusPrefix(prefix, text)`, `expectDropdownOpened()`, `applyFilter()`. Every
  filter panel across the whole app renders into the same `#filter-dropdown-root` portal, so
  these work for any filter on any page — never write a page-specific duplicate.
- `filterHelpers.ts` — action-only helpers with no assertions inside: notably
  `selectFilterChoiceExpandingAllOptions(pageObject, openFilter, choiceLabel)` (opens the
  filter, clicks "weitere anzeigen" if present, clicks the choice — does not apply).
- `filterAssertions.ts` — assertion-only helpers, all prefixed `expect...`, including
  `waitForTableSettled`/`expectTableSettled` (built-in stuck-loading recovery, see below),
  `expectEveryRowColumnToContain` (has an opt-in `ignoreCase` flag for columns whose rendered
  case differs from the filter's own label), `expectEveryRowPlzWithinRange`,
  `expectEveryRowStatusChipToBe` (Sales Actions Status chip, scoped by `role="status"`),
  `expectEveryRowAufgabeChipToBe` (Sales Actions Aufgabe task chip — has no stable attribute of
  its own, located by its own exact text instead), `nearestNonTransparentBackgroundColor`
  (climbs DOM ancestors for a real background color — `background-color` does not inherit, so
  locating a colored badge by its own visible text often resolves to a transparent inner span;
  **always start the climb from the deepest text node, never from an outer wrapper** — starting
  too high climbs past the real colored element into an unrelated ancestor's color, like a table
  row's own zebra-striping).
- `TableView.ts`'s constructor takes an optional 2nd `tableRoot?: Locator` parameter (added
  2026-09-16) — a page with a confirmed, more specific stable table-root class can pass it in
  to tighten `table`/`rows`/`loadingCells`/empty-state scoping for that page only, instead of
  `TableView`'s generic (and collision-prone) `page.locator('table, [role="table"],
  [class*="Table"]').first()` fallback. `SalesActionsPage.ts` is the first to use this —
  `new TableView(page, page.locator('[class*="_SA_Table"]'))`, confirmed live that every Sales
  Actions table root carries a `..._SA_Table` class (`Bestandsbau_SA_Table`/`FTTH_SA_Table`/
  `Neubau_SA_Table`). The other 5 pages still call `new TableView(page)` with no 2nd argument —
  completely unaffected, since the parameter is optional and falls back to the exact prior
  behavior. If another page's own stable table-root class ever gets confirmed, applying the
  same tightening there is the same one-line change — no further edits to `TableView.ts` needed.
- `door2doorRoutes` bare/root keys (`baulose.main`, `objekte.main`, `salesActions.main`,
  `benutzerverwaltung.main`) plus each page's bare `goToXPage()`/`expectLoadedX()` methods exist
  for testing the app's real auto-redirect-to-default-section behavior when no section is given
  in the URL — use `gotoDoor2DoorRoute` (hard `page.goto()`) for this, not `AppNavigation`'s
  soft in-app nav-link clicks.
- Environment recovery is already built into `BasePage.ts` and does not need to be re-invented
  per test: `registerErrorRecoveryHandler()` (auto-dismisses a recurring "Too Many Requests"
  overlay), `gotoWithRetry()` (retries `page.goto()` on transient connection errors),
  `expectWithRecovery()` / `AppNavigation.bounceToAnotherPageAndBack()` (recovers from a
  stuck-loading table via browser-history bounce, confirmed to preserve already-applied filters
  unlike a hard reload). `waitForTableSettled` already calls this recovery internally, so every
  other row-assertion helper that calls it gets the recovery for free.
- Search fields in this app do **not** use a native `placeholder` attribute — the visible
  "placeholder-like" text is a floating `<label for="{input-id}"><span>{text}</span></label>`
  sibling of the `<input>`. Use `BasePage.expectSearchFieldPlaceholderVisible(searchInput, text)`
  (or `SearchField.expectPlaceholder(text)`), never `toHaveAttribute('placeholder', ...)`.

### Locating things not exposed via `role`/id
Several custom controls in this app (Objekte's PLZ/Fragebogen/Verkaufsstart radios) don't
expose real ARIA roles to the accessibility tree — `getByRole('radio', ...)` silently finds
nothing even though a real `<input type="radio">` exists in the DOM. `FilterBar.choiceRadio()`
already works around this by matching on the real DOM input + label text instead of role — reuse
it rather than re-discovering the same workaround. A future FE ticket candidate, not yet raised.

---

## Project overview

| Item | Value |
|---|---|
| App | Door2Door (D2D) — React SPA, hash-based routing |
| Stack | Playwright + TypeScript, Node 18+, strict mode on |
| Auth | Manual 2FA via `tests/setup/auth.setup.ts`, storageState reuse |
| Environments | INT (`INTEGRATION_URL`) and PROD (`PROD_URL`) in `.env`, switched via `TEST_ENV`; per-page-folder `:int`/`:prod` npm scripts (`cross-env`), and a GitHub Actions `environment` dropdown |
| Auth state path | `playwright/.auth/user.json` (constant in `src/constants/auth.ts`) |
| Route constants | `door2doorRoutes` in `src/pages/BasePage.ts` |
| Stable HTML IDs | All in `src/frontend/shared/testIds/` (frontend repo) — see the FE ticket series below |
| ID reference | `D2D_Playwright_Attributes_Reference.md` — the single, git-verified source of truth (consolidated 2026-09-16, every claim cites a real commit hash; `testids-map.md`/`D2D_QA_Attributes_Work_Summary.md` are retired, they used to disagree with each other and with the live app). **Re-read this fresh before any locator/attribute suggestion**, don't rely on a recalled summary; if it doesn't cover an element, say so and ask for a live devtools check (or a fresh `git show` against the FE repo) rather than guessing |
| Architecture decisions | `decisions.md` |
| Best practices / roadmap | `best-practices.md` |

---

## Known bugs, decisions, and status (not derivable from the code alone)

- **Objekte Neubau sort-performance bug — confirmed real, Jira ticket filed 2026-09-02.** The
  `objects?type=NEUBAU&...&sortBy=SALESTART_DATE_TIME.DESC` request is slow specifically on INT
  — confirmed ~25s on INT (123 items) vs. ~0.67s on PROD (1,910 items, 15x more data), so it's an
  INT-environment-side issue (missing index / weaker backing DB / bad query plan), not a
  scaling problem. This is the prime suspect for any new "stuck loading, 60-120s timeout"
  failure specifically on Objekte Neubau. Mocking/caching this request's response was
  considered and explicitly rejected — it's the same request the filter-correctness tests need
  to verify against real data, so caching it would make those tests meaningless.
  **Observed 2026-09-13, unconfirmed:** the `test.skip()` this bug caused (in
  `objekteOrganisationFilterApply.spec.ts`, `objektePlzFilterApply.spec.ts`,
  `objekteQuickFiltersApply.spec.ts`, and likely other Objekte specs) is now commented out
  (`// test.skip();`) rather than active — but the explanatory comment above it still says
  "remove once that ticket is resolved," unchanged. This could mean the Jira ticket got fixed,
  or it could just be a manual, possibly temporary, re-enable to test something — **not
  confirmed either way**. Ask the user directly before assuming the underlying backend bug is
  actually fixed.
- **Resolved, not a bug:** a Sales Actions "abgeschlossen" Status chip once rendered the wrong
  grey inconsistently. Root cause was stale/corrupted data on one specific test record —
  recreating its customer interaction fixed it permanently. If a Status-chip colour assertion
  fails again, check whether it's isolated to one record first before suspecting a systemic
  rendering bug.
- **Temporary, deliberately generous Playwright timeouts** are in place because the INT
  environment itself is confirmed slow/flaky (corroborated by real CI runs showing
  `ERR_CONNECTION_REFUSED`/`ERR_ABORTED` across unrelated pages, and manually-captured 10+s
  requests) — not a code or locator problem. Current spots, **re-verified 2026-09-13 (raised
  again since this note was last written — the old numbers below were stale)**:
  `playwright.config.ts` top-level `timeout: 120_000`, `expect: { timeout: 120_000 }`, and a
  couple of `setTimeout`/hardcoded `{ timeout: 60000 }` spots in specs/`filterAssertions.ts`.
  `retries: process.env.CI ? 2 : 2` is enabled (was found fully commented out 2026-09-13,
  re-enabled the same day). Revisit and lower these once the environment stabilizes or the
  build-out reaches a natural pause — don't let them silently become the permanent baseline.
- **FE stable-attribute ticket series (POSS-3397 → POSS-3422, 24 tickets) is fully Done.**
  Every major page already has list-view, side-panel, and filter-bar attribute work landed —
  don't assume a page has no stable locators or needs new FE work first without checking
  `D2D_Playwright_Attributes_Reference.md` first.
- **CI retry-logic gap confirmed and fixed 2026-09-13.** User reported
  frequent Objekte CI failures (run 34758427895); checked the last 4 CI runs via `gh run list` /
  `gh run view --log-failed` before assuming a page-specific bug. **Confirmed this is NOT an
  Objekte-specific defect** — the exact same `net::ERR_TIMED_OUT`/`ERR_CONNECTION_REFUSED`/
  `ERR_ABORTED` navigation-error pattern also hit Sales Actions specs and
  `allPagesSmoke.spec.ts` (which touches every page) in the same runs, consistent with the
  already-documented general INT flakiness above. Objekte does have the highest absolute failure
  count in 2 of the 3 failed runs checked, most likely because it has the most navigation-heavy
  spec files among the built-out pages (most parameterized cases × most sections), not a defect
  in its own code. Two real, fixable gaps found while investigating: (1) `BasePage.ts`'s
  `gotoWithRetry` retry regex does not include `ERR_TIMED_OUT`, which is now showing up
  repeatedly in CI — any goto() hitting that specific error gets zero retries and fails
  immediately on the first attempt. (2) The top-level `timeout: 60_000` in `playwright.config.ts`
  is shorter than `use.navigationTimeout: 120_000` — so the "generous" navigation timeout can
  never fully play out; the outer per-test clock kills the test/`beforeEach` hook before a slow
  goto() (or its retries) gets anywhere near its own 120s allowance, matching the repeated
  "Test timeout of 60000ms exceeded while running "beforeEach" hook" CI failures seen across
  multiple runs. **Fixed, with the user's approval:** `gotoWithRetry` now matches `ERR_TIMED_OUT`
  too, and gives each attempt its own bounded `attemptTimeoutMs` (default 20s) instead of
  inheriting the global `navigationTimeout`; `playwright.config.ts`'s top-level `timeout` raised
  60s → 90s to comfortably exceed the retry loop's worst case (3 x 20s + 2 x 3s delay ≈ 66s).
  `npm run typecheck` passes. **Committed as `b570b9d` ("Retry goto() on ERR_TIMED_OUT and stop
  the outer test timeout from cutting retries off early") — confirmed present in `BasePage.ts`
  on this machine 2026-09-14, so this note's earlier "not yet committed" caveat no longer
  applies.** Not yet verified against a real CI run — worth watching the next scheduled/manual
  run to confirm the same failure pattern doesn't recur.
- **Separate local-only issue confirmed 2026-09-13: `--headed` local runs leave worker processes
  that don't exit cleanly, unrelated to the CI fix above.** User pasted terminal history from
  several local `npx playwright test tests/ui/objekte` runs. The confusing
  "N errors were not a part of any test, see above for details" line is Playwright's own
  `Error: worker-N process did not exit within 300000ms after stop, force-killed it` — a
  process-teardown timeout, not a real test/business-logic failure (no artifacts are written for
  it, and it's not tied to any specific spec). Confirmed correlation across the pasted history:
  every `--headed` run had this (2, then 2, then 4 occurrences); the one plain headless run had
  zero. Root cause traced to the user having `Ctrl+Z`'d (suspended, not killed) an earlier
  `--headed` run — confirmed via `ps` showing that process still in `T` (stopped) state 5+ hours
  later, PID tree 41712/41732/41766/41767, still holding its Chrome session open. Each subsequent
  `--headed` run then has to compete with that leftover suspended session for local resources,
  making clean worker shutdown slower/likelier to hit the 300s ceiling. **Not an Objekte bug, not
  a code bug at all** — advise: prefer headless for routine local runs (`npx playwright test
  tests/ui/objekte`, no `--headed`), and use Ctrl+C rather than Ctrl+Z to stop a run early — Ctrl+Z
  freezes the process without letting Playwright attempt any teardown at all, guaranteeing this
  exact kind of leftover mess.
- **Local `workers` count is machine-dependent — confirmed 2026-09-14 on a second (personal)
  laptop.** `playwright.config.ts`'s local `workers` was found bumped `3 → 6` on this machine,
  uncommitted. That change lines up exactly with two real local failures seen the same day: a
  Chrome `Network service crashed or was terminated, restarting service` log followed by
  `browser.newContext: Test ended`, and a separate `locator.click: Target page, context or
  browser has been closed` thrown from inside `bounceToAnotherPageAndBack`'s stuck-loading
  recovery (the context was already gone by the time recovery tried to click something). Root
  cause: 6 parallel headless Chrome instances is real resource pressure, and this machine
  apparently can't sustain it the way `workers: 3` has been stable elsewhere — not a code or
  locator bug. **Fixed, with the user's approval: reverted to `workers: process.env.CI ? 3 : 3`
  on this machine.** Since `workers` is a local, uncommitted-by-nature value that can legitimately
  differ per machine's hardware, don't assume `3` is a hard ceiling everywhere or that `6` is
  simply "wrong" — if this comes up again on a *different* machine, step the count up
  incrementally and watch for this exact crash signature rather than assuming the same limit
  applies.
- **Sequencing decision:** finish filter+results test coverage across *every* page (breadth)
  before starting any page's deeper Side Panel testing (content, Customer Interaction creation,
  status pickers) — deliberately deferred, not skipped, so the filter-testing patterns/
  infrastructure stay fresh while building it out, rather than context-switching to a
  qualitatively different testing domain (iframes, CRUD flows) mid-way.

**Current build-out status is a moving target — don't trust a hardcoded snapshot of "which
filter is done" here, it will go stale immediately.** To check what's actually built vs. stubbed
right now: `grep -rl "test.describe.skip" tests/ui/<page>/` for stubs still pending, then also
count real `test(...)` cases inside — a file can contain a `test.describe.skip()` wrapper around
zero tests while its filename still suggests it's done. `git log --oneline -20` for recent work,
or just open the relevant `{page}{FilterName}FilterApply.spec.ts` directly. As of this writing
(2026-09-13, corrected via a full code audit — the previous version of this paragraph had
Organisation/Phase wrong, see below) the rough order has been Baulose (Availability done; 4 of 5
filters have a real Apply file — Organisation, Phase, Regime, Status; Importdatum has no Apply
spec file yet at all) → Objekte (Availability, Search, Side Panel done; all 6 Apply files real;
Neubau's `test.skip()` for the sort-performance bug is currently commented out on 3 of those 6 —
see the unconfirmed note above) → Sales Actions (in progress — Availability done; 12 of 18
filters have a real Apply file as of 2026-09-16: Ergebnis, Aufgabe, AblegerZustimmung,
Baulos-Einsatzname, Immobilienart, Bestellung über D2D, Kundendaten (new icon-column
verification pattern, see below), Phase (reuses the side-panel-header check already proven by
Ableger Zustimmung), Regime (new — reuses Baulose's confirmed VHCN/ZAG=FTTH-only,
FTTB/FTTC=Bestandsbau-only split; row-check via each row's own `data-regime` attribute, a new
`expectEveryRowRegimeToBe` helper), Status (new — row-check reuses the already-proven
`expectEveryRowStatusChipToBe`; confirmed live that NOT_EXECUTABLE renders "nicht
durchführbar" exactly matching `SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS`; since finished —
checked across all 3 sections, CARRIED_OUT's German label confirmed as "durchgeführt," see the
fuller note below), Organisation (new —
confirmed 2026-09-15 that unlike Objekte, there's no dedicated Organisation cell here at all;
the name instead renders inside the "zugewiesen an" assigned-to cell, in its own stable div
`.CtitwbHLBT1uebUegj6o`, alongside content that varies row to row — 1-3 assignee-name lines
above it, an optional "(übergeben)" suffix below it — so the row-check is scoped to that one
div specifically rather than the whole cell's text; a class-based locator, flagged as
structurally unavoidable since no id/data-attribute exists for that specific line),
Planskizze (new — same shape as Bestellung über D2D: FTTH-AUSBAU-only, radio dropdown
offen/abgeschlossen, verified in the side panel's info section via a field-label-div +
sibling-chip pattern, text + color both checked against `SIDE_PANEL_CHIP_COLORS`. **One new
disambiguation technique worth remembering:** the label text "Planskizze" appears *twice* in
the side panel — once as an action-bar quick-link button, once as this info-section field —
so `page.locator('#ftth-object-side-panel').getByText('Planskizze', {exact:true})` alone would
strict-mode-violate; `.last()` reliably picks the info-section one since the button always
renders first in DOM order. Applies to any other field whose label text might collide with a
button elsewhere in the same panel — check for this before assuming a plain `getByText` is
safe. **Corrected 2026-09-16, same day:** the choice-selection step for both Planskizze and
Bestellung über D2D originally used dedicated page-specific locators
(`offenRadioOptionInPlanskizzeFilter` etc.) that just re-derived, by hand, what
`filters.choiceLabelButton(label)` already provides generically via the shared
`#filter-dropdown-root` portal — a direct violation of the "never write a page-specific
duplicate" rule for `FilterBar.ts` stated earlier in this file. Both specs now call
`salesActionsPage.filters.choiceLabelButton(...)` directly instead, and the 4 redundant
locators (plus the now-unused `BestellungUeberD2DOptions`/`Planskizze` import they needed)
were removed from `SalesActionsPage.ts` entirely. If a future filter's "select this choice"
step is tempted to add a dedicated named locator instead of using `choiceLabelButton`, that's
the same mistake — don't repeat it).
**Flaky-assertion bug found and fixed 2026-09-16 in `salesActionsBestellungUeberD2DFilterApply.spec.ts`:**
both FTTH tests' "Verify that the side panel is opened" step checked
`salesActionsPage.aktvititenSidePanelSection` (just `page.getByRole('link', {name:
/^Aktivitäten/i})` — the AKTIVITÄTEN tab link, unrelated to whether the panel actually opened
for the right sales action) instead of the real check, `expectFtthSalesActionSidePanelOpen()`
(URL pattern + the FTTH panel's actual root visible, same one Planskizze already uses
correctly). This was flagged after the user saw this exact test fail intermittently
(`FTTH-AUSBAU:Verify that nicht erfasst option update list items accordingly`) and asked
whether the `choiceLabelButton` refactor above had caused it — **confirmed it did not**: that
refactor only touched the selection step, not this one, in either test. The wrong-assertion
bug is a much more likely explanation for the intermittent failures than the refactor. Both
occurrences fixed to call `expectFtthSalesActionSidePanelOpen()` directly.

**Follow-up, same day:** the very next live run showed `expectFtthSalesActionSidePanelOpen()`
itself failing — `locator('#ftth-object-side-panel')` "element(s) not found" — on the same FTTH
"nicht erfasst" test, one step later than before. Root cause found by reading the actual test
order, not by guessing: the FTTH test applied the Bestellung über D2D filter while `beforeEach`
had already landed it on **NEUBAU** (the bare Sales Actions route's default redirect), then
called `gotoFtthSalesAction()` — confirmed via `BasePage.gotoDoor2DoorRoute()` →
`gotoWithRetry()` to be a real `page.goto()`, i.e. a full page reload — to reach FTTH
*after* applying the filter. A hard reload re-initializes the SPA from scratch and there is no
filter query param in any confirmed route in this app, so the just-applied filter almost
certainly does not survive that navigation; the row clicked afterward is from an
unfiltered/still-settling FTTH list, which explains a row existing (the click succeeded) but the
side panel not rendering in time (the "element(s) not found"). Planskizze (written earlier the
same day) never had this problem because it navigates to FTTH **first**, then opens/applies the
filter, with no navigation after — the safer order. Fix: reordered both FTTH tests in
`salesActionsBestellungUeberD2DFilterApply.spec.ts` (nicht erfasst + erfasst) to navigate to
FTTH via `gotoFtthSalesAction()` + `expectLoadedFTTH()` **first**, before opening the filter
dropdown, matching Planskizze's structure exactly; the old "apply filter, then hard-navigate to
FTTH" step is gone. `npm run typecheck` clean. **Not yet re-run against a live INT session** —
still needs a real run to confirm this was the actual cause and not just a second symptom of the
same underlying flakiness.

**Lesson:** when a filter needs to be verified inside a specific section (FTTH/Neubau/Bestandsbau),
navigate to that section *first*, then open/select/apply the filter there — never apply a filter
and then navigate afterward, since navigation in this app is a hard `page.goto()` that can drop
client-side filter state.
remaining filters genuinely not started: Termin, Sales
Action-Type, Objekt, zugewiesen an, upselling Potential) →
Benutzerverwaltung/Importe/Konfiguration not yet started. **Also verified 2026-09-13: the
Dropdown Content bucket (file 2 of the 3-file split) is at 0% on every page — all 27
`*FilterDropdown.spec.ts` files that currently exist (Baulose 5, Objekte 5, Sales Actions 17) are
still empty stubs with zero real tests; that's the next real gap to close, not any one page's
Apply coverage.**

**Sales Actions Regime and Status are functionally built but the user is still personally
reviewing both for mistakes as of 2026-09-16 — treat as "likely to change," not final.**
Regime review round 1 found 4 things: (1) a stale doc comment in `salesActionFiltersValues.ts`
claiming "Neubau has no Regime data" directly contradicted by the `wbtmBestand`/`wbtmNeubau`
entries in the same object — **fixed, comment removed**; (2) same stale claim duplicated in
`salesActionsRegimeFilterApply.spec.ts`'s own header comment (lines 5-8) — **still NOT fixed,
still says the old wrong thing**, this is the one concrete pending fix; (3) missing
`expectLoadedX()` readiness calls before the negated-section empty-state assertions — **fixed**
by the user; (4) two different sections' empty-checks bundled into one `test.step` instead of
one each — **fixed** by the user, went further than what was asked. **Resolved 2026-09-16 (user
confirmed directly):** `wbtmBestand: { label: 'WBTM Bestand', expectedInNeubau: true, ... }` is
correct as written — despite the label saying "Bestand," both `"WBTM Bestand"` and
`"WBTM Neubau"` are genuinely Neubau-section regime values, not a copy-paste mix-up. No longer
an open question.
**Status is now functionally complete as of 2026-09-16 (`072cdbb`).** Final shape:
`salesActionStatusOptions` entries have `chipLabel` (the filter dropdown's own choice text,
used for selecting + the filter-bar chip check) separate from `listChipLabel` (the bare text
actually rendered in the row's chip — needed because `abgeschlossenPositiv`/
`abgeschlossenNegativ`'s `chipLabel`s carry a `" - positiv"`/`" - negativ"` suffix the dropdown
uses to distinguish them, but the row itself just renders bare `"abgeschlossen"` for both,
color-distinguished instead), plus a `color` field referencing
`SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS` directly (`undefined` where unconfirmed). All 6
options now have confirmed colors except none remain unconfirmed — `offen`
(`rgb(229, 151, 0)`) and `durchgeführt`/CARRIED_OUT (`rgb(77, 150, 0)`, same green as
`abgeschlossenPositive` — confirmed intentional, not a copy-paste duplicate) were the last two
filled in. **Section behavior:** `durchgeführt` is Neubau-only (hard checks: real rows there,
hard-empty on FTTH-AUSBAU/Bestandsbau); every other status is checked across all 3 sections via
`expectEveryRowOrEmptyState` — since this suite runs as Admin (sees more Sales Actions than an
Agent/Channel user would), a section legitimately can come back empty for a given status
without that being a bug, so a genuinely empty section still passes but gets a report
annotation flagging it for manual confirmation. A `TODO` in the spec's header notes the
deferred idea (not yet built) of a data-seeding prerequisite step that would let these become
hard assertions later.
**One naming trap hit and fixed along the way:** `salesActionsTableChipColors.ts` is *shared*
with the already-working `salesActionsErgebnisFilterApply.spec.ts`, which references the
original `abgeschlossenNegative`/`abgeschlossenPositive` (with a final "e"). A mid-session
rename to `abgeschlossenNegativ`/`abgeschlossenPositiv` (dropped the "e", to fix an unrelated
`TypeError`) silently broke Ergebnis instead — caught via `npm run typecheck`, fixed by
reverting the shared file's spelling back to the original and correcting the 2 new references
in `salesActionStatusOptions` instead. Lesson: when a shared constants file needs a key
renamed, grep every consumer first, don't assume the new caller is the only one.

**Second row-verification pattern confirmed and now in real use — Side Panel chip lookup, for
filters with no list-column representation at all.** Distinct from `expectEveryRowStatusChipToBe`
(Status column, row-scoped, `role="status"`) and `expectEveryRowAufgabeChipToBe` (Aufgabe column,
row-scoped, text-located): some filters (Bestellung über D2D confirmed; Ergebnis/Aufgabe/
Planskizze/Ableger Zustimmung/Kundendaten suspected, same category) only show their result inside
a Sales Action's **side panel**, not any table column. Pattern: open the first matching row's
side panel, read the relevant chip's text/color there via page-specific methods (e.g.
`SalesActionsPage.checkBestellungUeberD2DStatusInSidePanel()` /
`expectBestellungUeberD2DStatusChipColour()`), against lookup constants
`src/constants/salesActionSidePanelChipStatus.ts` (label text per option, e.g.
`BestellungUeberD2DOptions`, `Planskizze`) and `src/constants/salesActionSidePanelChipColors.ts`
(`SIDE_PANEL_CHIP_COLORS`, color per label text — **note this is a different, separate color
table from `SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS`/`SALES_ACTIONS_TABLE_AUFGABE_CHIP_COLOR`,
which are for the list-row chips, not the side-panel ones — don't conflate the two**).
**Correction 2026-09-14: Kundendaten is NOT in this side-panel category** — see the icons-column
finding directly below, it has its own dedicated list-column representation instead.

**Third row-verification pattern confirmed 2026-09-14 — the row's "icons" column
(`BESTANDSBAU_COLUMNS`/`FTTH_COLUMNS`/`NEUBAU_COLUMNS.icons`, index 3, in the new
`src/constants/salesActionsColumnsValues.ts`) is a third distinct mechanism, for filters whose
result renders as a small SVG icon rather than a text chip.** Confirmed live via devtools on
Kundendaten: the column always has 2 slot divs, slot 1 can hold up to 2 icons and slot 2 up to 1,
and each icon type appears at most once per row — so the right way to check for one specific
icon is to key a locator on that icon's own unique `<svg><path d="...">` value (`row.locator('svg
path[d^="<distinctive prefix>"]')`, scoped to the row), never on the surrounding wrapper classes
(`BrQIfq2NULZl0psfQ55A`/`PZa7BVFGq2MAw2SelECe`/`gucci-icon-v2` are CSS-module-generated and not
locator-priority-safe) or a generic "any icon" locator (would strict-mode-violate on rows with
2+ icons). Confirmed 3 icon meanings so far, all independently present/absent per row:
- Person silhouette, `viewBox="0 0 22 22"`, path starts `M11 11a5.332 5.332 0` → Kundendaten present
- Lightbulb, `viewBox="0 0 32 32"`, path starts `M17 0h-2.133v5.333H17V0z` → a Notiz was added
- House, `viewBox="0 0 32 32"`, path starts `M18.286 1.999h-4.572` → Upselling Potential (confirmed Bestandsbau-only)

**Confirmed identical on INT and PROD (2026-09-14)** via a devtools console check (querying
`svg path` for each prefix and comparing the full `d` value) — safe to rely on across both
environments, exactly because it's keyed on the icon's actual vector data rather than a
build-generated CSS-module class hash (which legitimately can differ between an INT build and a
PROD build even when the component itself hasn't changed). **`salesActionsKundendatenFilterApply.spec.ts`
is now written and confirmed working by the user (2026-09-15).**

**Phase spec extended 2026-09-16 — the chip is checked in TWO places, not just the side
panel.** The original version of this spec (side-panel-only, `phaseChipInSidePanelHeader`)
missed that Pre-Contracting/2nd Run also render a Phase chip directly in the row's main-info
cell (list view, `FTTH_COLUMNS.adresse` — the row's chip lives right after the Regime text,
same styling class other row chips reuse). Confirmed colors: Pre-Contracting =
`rgb(98, 149, 172)` (same blue as Status's `inbearbeitung`), 2nd Run = `rgb(229, 151, 0)`
(same orange as `SIDE_PANEL_CHIP_COLORS['nicht erfasst']`/`'offen'`) — added as their own
separate `SALES_ACTIONS_TABLE_PHASE_CHIP_COLORS` constant in `salesActionsTableChipColors.ts`
(kept apart from `SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS` even though 2 colors coincide,
since Phase and Status are different concepts) and as 2 new keys directly in the existing
`SIDE_PANEL_CHIP_COLORS` for the side-panel check (`SalesActionsPage.expectPhaseChipInSidePanelHeaderColourToBe()`,
new). `phaseFilterOptions` was restructured from plain strings to `{label,
expectChipDisplayed}` (Keine Phase = `false`, same "no chip for the null case" Baulose's own
Phase filter already has) — the 3 usages in `salesActionsAblegerZustimmungFilterApply.spec.ts`
were updated to match (`.secondRun` → `.secondRun.label`). New `expectNoRowColumnContains`
helper added to `filterAssertions.ts` (inverse of `expectEveryRowColumnToContain`, for the
Keine Phase absence check). `npm run typecheck` passes.

**`src/constants/bauloseTableChipColors.ts` corrected 2026-09-16 — populated, not left
empty.** Originally scaffolded empty (a repo-wide search found no existing Baulose
chip-color checks to extract from), but the user clarified: Baulose's Phase filter renders
the identical chip as Sales Actions' Phase filter, so the same 2 confirmed colors apply —
`BAULOSE_TABLE_PHASE_CHIP_COLORS` (Pre-Contracting `rgb(98, 149, 172)`, 2nd Run
`rgb(229, 151, 0)`). Wired into `baulosePhaseFilterApply.spec.ts`'s existing
`expectEveryRowColumnToContain` call (previously text-only, no `expectedBackgroundColor` at
all) — Keine Phase's color stays `undefined` (opt-in check, unconfirmed) since it has no
confirmed chip color of its own.

**Bug found during a 2026-09-13 audit, fixed the same day —
`salesActionsBestellungUeberD2DFilterApply.spec.ts`:** every "Verify that filter chip is
displayed correctly" step (**6 occurrences, not 4 as first counted** — lines 38, 83, 110, 133,
178, 205) did
`await salesActionsPage.filters.filterBarChipPlusPrefix(label, option);` with no `expect(...)`
wrapper — `filterBarChipPlusPrefix` returns a `Locator` synchronously, so `await`ing it directly
was a no-op and asserted nothing at all. Fixed to
`await expect(salesActionsPage.filters.filterBarChipPlusPrefix(label, option)).toBeVisible();`
at all 6 call sites, with the user's go-ahead per the approval gate.

**Open loose ends as of 2026-09-13:**
- `KonfigurationPage.ts`'s header locator (now named `navSideBarHeader`, not `pageHeader` —
  renamed at some point after this note was first written) — scoped to
  `#configuration-navigation-sidebar` (a confirmed-stable id, see ADR-008/009 in `decisions.md`)
  `.getByText('Konfiguration', {exact:true})`. Better-scoped than before, but the header text
  match itself is still explicitly commented "unconfirmed markup" in the source — not yet
  verified via devtools.
- Several Sales Actions filters under active development (Immobilienart confirmed, likely others
  using the same pattern) have a `// row-check — see blocker below` placeholder where a per-row
  content assertion should be — blocked on getting the real row HTML from devtools for that
  specific filter before the assertion can be written correctly.
- The `expectFilterVisible(filterId): Locator` duplicate-of-`trigger()` method previously flagged
  here has been removed from `FilterBar.ts` — resolved, no longer an open item.
- **Cross-machine memory gap confirmed 2026-09-13:** several Sales Actions stub files (e.g.
  `salesActionsOrganisationFilterApply.spec.ts`, `salesActionsPhaseFilterApply.spec.ts`,
  `salesActionsBestellungUeberD2DFilterApply.spec.ts`'s header comment) point to local-memory
  entry names (`reference-sales-actions-filters`, `project-sales-actions-filters-apply-progress`,
  `project-breadth-first-filter-coverage`) as where "the confirmed locators and plan" live. On
  this machine `~/.claude/projects/.../memory/` is completely empty, so whatever was in those
  entries is not recoverable here — it was written on some other laptop and never made it into
  this file. If you still know what those entries said, it's worth dictating the actual
  locator/plan content into this file directly rather than trusting a spec-file comment to point
  at memory that may not travel with you.
- **New shared helper written 2026-09-13, not yet verified against a real INT run:**
  `expectEveryRowOrEmptyState(pageObject, verifyRowContent, emptyStateAnnotation)` added to
  `filterAssertions.ts` — wraps a row-content check for filters whose correct result can
  legitimately be zero rows depending on what data currently exists (e.g. a rolling relative-date
  window), verifying the empty-state UI plus a `test.info().annotations` note instead of failing
  outright when the row count is 0. Wired into `objekteVerkaufsstartFilterApply.spec.ts`'s
  Verkaufsstart-Termin NEUBAU check, which was previously failing whenever no Neubau object's
  Verkaufsstart date fell inside the current 8-day/6-week window. `npm run typecheck` passes.
  Deliberately written with a caller-supplied callback (not hardcoded date-range logic) so it can
  be reused later by Sales Actions' Termin filter if that one hits the same data-availability
  issue — not yet confirmed SA's Termin actually needs identical logic, that spec is still an
  empty stub. **User is testing this against a real run before deciding whether to commit/push —
  do not treat as confirmed working, and do not move it into the "already built" reusable-infra
  list below until they confirm.**
- **Done 2026-09-16 — the 3 overlapping attribute-reference docs are consolidated into one,
  verified directly against real git history rather than secondhand summaries.** A background
  research agent read all 27 non-duplicate commits across POSS-3397→3422 directly from the FE
  repo (available locally at `D2D Repo\microfrontend-door2door-main`, sibling of
  `D2D_Automation`), cross-checked every claim in the 3 old docs against what the commits
  actually show, and drafted a discrepancy report + replacement doc. Found ~10 confirmed
  contradictions (worst: `testids-map.md`, 4 entirely wrong sections including the known
  Baulose `data-display-name` bug) and 2 unverifiable claims. **Independently spot-checked by
  hand afterward** (not just trusted): `Table.tsx`/`TableEntry.tsx`'s `tr-` prefix + spread
  order, the customer-interaction toggle's `data-testid` (not `id`), the unreachable
  `SALES_ACTION_PANEL_IDS.noteAddButton` — all 3 confirmed correct directly in the FE source.
  **Also verified branch/PR completeness** (a real concern the user raised): every one of the
  21 surviving `origin/POSS-34xx` branches has zero commits not already in `main` (the one
  apparent exception, `POSS-3418` showing "1 ahead" on GitHub, turned out to be a stray
  `POSS-3419` commit sitting on the wrong branch — already accounted for, not missed work);
  `POSS-3397`/`3398`/`3399` have no surviving branch (deleted after merge, normal) but their
  commits are confirmed present in `main`'s history; every ticket's real merge commit was
  found and its diff stat captured (2–39 files each, all non-trivial, nothing suspiciously
  empty). **Result:** `D2D_Playwright_Attributes_Reference.md` now contains the consolidated,
  commit-cited content; `D2D_QA_Attributes_Work_Summary.md` and `testids-map.md` are deleted;
  the two scratch output files are deleted too (their content is now in the real doc).

**Sales Actions Termin filter, "mit Termin" option only — added 2026-09-16.** Unlike
Planskizze/Bestellung über D2D, this one is NOT FTTH-only: confirmed with the user that
"mit Termin" is relevant for FTTH-AUSBAU **and** BESTANDSBAU, with NEUBAU always empty (the
inverse of the other two filters' section split). A matching row has no visible table
column/chip for this — the only way to verify it is inside the side panel's AKTIVITÄTEN tab.
Confirmed via live DOM the user pasted: whenever an activity (customer-interaction or
appointment accordion entry — id prefixes `accordion-header-customer-interaction-` and
`accordion-header-appointment-`) has a scheduled Termin, a
`Termin DD.MM.YYYY HH:MM - HH:MM` badge (plus stattgefunden/nicht stattgefunden/verschoben
status) renders directly in its accordion **header**, before any click/expand. Confirmed 1:1
with the user: an activity with no Termin omits this badge entirely (no empty placeholder),
and the word "Termin" doesn't appear anywhere else in that tab — so a plain text match is
safe proof in both directions, no accordion-clicking needed at all. New:
`SalesActionsPage.expectAktivitatenHasAtLeastOneTermin()` (reuses the existing
`accordionBodyContent` locator) and `filterAssertions.expectFirstNRowsSatisfy(pageObject,
verifyRow, sampleSize = 10)` — generic on purpose, not Termin-specific, for any future filter
whose result can only be verified per-row inside a side panel. FTTH/Bestandsbau each sample
up to 10 rows (capped by actual row count) rather than just the first one, since a single row
is weaker evidence here than for a table-visible chip. `npm run typecheck` clean.

**Confirmed live by the user 2026-09-16: "mit Termin" works as expected against a real INT
run.** Same day, added "ohne Termin" to the same spec file: confirmed with the user this one
covers ALL THREE sections (FTTH, Neubau, Bestandsbau) as real/checkable, not just 2 of 3 —
no section is expected empty for it, unlike "mit Termin"'s Neubau-always-empty rule. Added
the inverse assertion `SalesActionsPage.expectAktivitatenHasNoTermin()` (same
`accordionBodyContent` locator, same confirmed 1:1 badge correspondence, just
`toHaveCount(0)` instead of `.first()` `toBeVisible()`), reused `expectFirstNRowsSatisfy` for
all 3 sections. `npm run typecheck` clean.

**Two issues found running "ohne Termin" live, same day (2026-09-16):**

1. **Neubau mixes two Sales Action types — fixed.** Confirmed by the user: Neubau's list
   contains "Objekt Sales Action" rows (advertising/marketing — Bauträger Übergabemappe,
   Mieterliste, Mietervorveranstaltung, Sales Personal, Türhänger, Verkaufsstand,
   Werbemittelmaßnahmen) which have **no customer interaction at all, not even the
   ÜBERSICHT/AKTIVITÄTEN side panel tabs**, alongside "D2D Sales Action" rows (A1 Internet
   Ready Check, D2D Verkauf) which do have those tabs. Termin only makes sense for the
   latter. Fixed by adding a Sales Action-Type filter step (id `salesActionType`, already
   scaffolded) selecting `D2D Verkauf` before sampling rows, in Neubau's "ohne Termin" test
   only (the only Neubau test that samples real rows — "mit Termin" Neubau just checks
   empty). New constant `salesActionTypeFilterOptions` in `salesActionFiltersValues.ts`
   records all 9 options (both groups) for later reuse; only `d2dVerkauf` is wired in today.
   **Follow-up, same day:** the plain `choiceLabelButton(...).click()` selection failed
   live — `D2D Verkauf` is hidden behind a "N weitere anzeigen" expand button (N varies by
   filter, not always 4) since Sales Action-Type has too many choices to show at once.
   Rather than build something new, switched to the already-existing, already-proven
   `filterHelpers.selectFilterChoiceExpandingAllOptions()` (used by Aufgabe, Regime,
   Ergebnis, and 3 Baulose filters already) — it calls `FilterBar.expandMoreChoicesIfPresent()`
   first, which clicks `showChoicesButton` (`getByText(/weitere anzeigen/i)`, already
   number-agnostic, scoped to `#filter-dropdown-root` — the same portal as
   `genericDropdownMenuOption`) only if it's actually present, so it's a safe no-op for
   filters with few enough options to not need it.
   **Final correction by the user, confirmed live:** Sales Action-Type's `D2D Verkauf` is a
   checkbox choice, not a radio — `choiceCheckbox()` instead of `choiceRadio()` for its
   checked-state assertion. Its filter chip also renders with no prefix label (unlike
   Termin's own chip) — `filterBarChip(label)` instead of `filterBarChipPlusPrefix(...)`.
   Confirmed working end to end.
2. **BESTANDSBAU "ohne Termin" fails live — left as `test.fixme()`, not silently patched.**
   Some returned rows actually do have a Termin. Confirmed by the user: on BESTANDSBAU, a
   `D2D Verkauf` sales action automatically becomes `A1 Internet Ready Check` once it gets a
   Termin — a system-driven type change. Likely the same root cause as issue 1 (an
   auto-reclassified row not excluded the way Neubau's Objekt Sales Action rows now are),
   but **deliberately not "fixed" by guessing** — the user wants to ask their lead/designer
   what the expected behavior should be first (should "ohne Termin" scope to a specific
   Sales Action-Type on Bestandsbau too, and if so which one?). Test body left intact with a
   `FIXME` comment recording the hypothesis, so it can be re-enabled once answered.

`npm run typecheck` clean. Out of scope for now: `mitTerminHeute`, `mitTerminImZeitraum` —
the other 2 entries in `terminFilterOptions` — still need their own tests later.

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

// Bare/root keys — for testing real auto-redirect-to-default-section behavior
door2doorRoutes.baulose.main
door2doorRoutes.objekte.main
door2doorRoutes.salesActions.main
door2doorRoutes.benutzerverwaltung.main

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
  constants/          auth.ts, route/filter-option/chip-color constants — mirrors of real app ids/values, never imported live from the FE/BE repos
  fixtures/           object.fixture.ts (objektePage + salesActionsPage), salesAction.fixture.ts, api.fixture.ts — page objects injected via test.extend(), no manual `new XPage(page)` needed in specs
  helpers/            filterHelpers.ts (actions, no assertions), filterAssertions.ts (assertions, all prefixed expect...)
  pages/              One file per app section, all extend BasePage
    BasePage.ts       door2doorRoutes + buildDoor2DoorUrl + gotoDoor2DoorRoute + shared recovery mechanisms
    index.ts          Barrel re-exports for all page objects
tests/
  setup/              auth.setup.ts — manual 2FA login, saves storageState
  preflight/          preflight.spec.ts — smoke: app mounts with saved auth
  ui/                 Feature specs (UI), one folder per page, 3 files per filter (see Testing conventions above)
  api/                Feature specs (API)
D2D_Playwright_Attributes_Reference.md   The ID/attribute catalog — git-verified, re-read fresh each time
decisions.md                         Architecture decisions log (ADR-001+, "in force")
best-practices.md                    Assertion/locator/test-structure conventions + roadmap
```

---

## Playwright config — project dependency chain

```
setup → ui-preflight → chrome (UI tests)
setup → api (API tests — separate project, no browser)
```

The `api` project does not depend on `ui-preflight`. Keep them independent.
