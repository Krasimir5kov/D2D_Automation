# Buttons & Locators — Aufgaben (Tasks)

## Button Inventory

| # | Visible Label | Tag | Has data-testid | Has aria-label | Has id | Has name | Stable Locator? | Recommended Locator |
|---|---|---|---|---|---|---|---|---|
| 0 | Widget Versions | a | no | no | no | no | NO | `page.getByRole('link', { name: /Widget Versions/i })` |
| 1 | Abmelden | a | no | no | no | no | NO | `page.getByRole('link', { name: /Abmelden/i })` |
| 2 | Home | a | no | no | no | no | NO | `page.getByRole('link', { name: /Home/i })` |
| 3 | Door 2 Door | a | no | no | no | no | NO | `page.getByRole('link', { name: /Door 2 Door/i })` |
| 4 | Timey | a | no | no | no | no | NO | `page.getByRole('link', { name: /Timey/i })` |
| 5 | Cockpit-Leistungspositionen | a | no | no | no | no | NO | `page.getByRole('link', { name: /Cockpit-Leistungspositionen/i })` |
| 6 | Case Comments | a | no | no | no | no | NO | `page.getByRole('link', { name: /Case Comments/i })` |
| 7 | Case Document Viewer | a | no | no | no | no | NO | `page.getByRole('link', { name: /Case Document Viewer/i })` |
| 8 | Address List | a | no | no | no | no | NO | `page.getByRole('link', { name: /Address List/i })` |
| 9 | Baulose | a | no | no | no | no | NO | `page.getByRole('link', { name: /Baulose/i })` |
| 10 | Objekte | a | no | no | no | no | NO | `page.getByRole('link', { name: /Objekte/i })` |
| 11 | Sales Action | a | no | no | no | no | NO | `page.getByRole('link', { name: /Sales Action/i })` |
| 12 | Benutzerverwaltung | a | no | no | no | no | NO | `page.getByRole('link', { name: /Benutzerverwaltung/i })` |
| 13 | Importe | a | no | no | no | no | NO | `page.getByRole('link', { name: /Importe/i })` |
| 14 | Konfiguration | a | no | no | no | no | NO | `page.getByRole('link', { name: /Konfiguration/i })` |
| 15 | Übersicht | a | no | no | no | no | NO | `page.getByRole('link', { name: /Übersicht/i })` |
| 16 | Abschlussgründe | a | no | no | no | no | NO | `page.getByRole('link', { name: /Abschlussgründe/i })` |
| 17 | Aufgaben | a | no | no | no | no | NO | `page.getByRole('link', { name: /Aufgaben/i })` |
| 18 | Gruppen | a | no | no | no | no | NO | `page.getByRole('link', { name: /Gruppen/i })` |
| 19 | Regime | a | no | no | no | no | NO | `page.getByRole('link', { name: /Regime/i })` |
| 20 | Aktivitäten Setup | a | no | no | no | no | NO | `page.getByRole('link', { name: /Aktivitäten Setup/i })` |
| 21 | Aufgabe erstellen | button | no | no | no | no | NO | `page.getByRole('button', { name: /Aufgabe erstellen/i })` |
| 22 | _(search input)_ | input | no | no | yes | no | YES | `page.locator('#sales-action-tasks-search-field')` |
| 23 | _(icon-only)_ | button | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 24 | _(none/hidden)_ | div | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 25 | Extend authentication | a | no | no | yes | no | YES | `page.locator('#mashroom-portal-auth-expires-extend')` |
| 26 | A1 Telekom Austria Group | a | no | no | no | no | NO | `page.getByRole('link', { name: /A1 Telekom Austria Group/i })` |

**Total elements:** 27  
**With stable locators:** 2 (elements #22 and #25 have IDs)  
**Without stable locators:** 25 — rely on visible text, role, or long DOM path

## Locator Quality Issues

The following elements currently rely only on CSS class or position for differentiation:

- **#23** (`button.search-button.icon-a1-lupe`): Icon-only search button. No text, no aria-label, no id, no data-testid. Class names are obfuscated/generic. This is a **critical locator risk** as well as an **accessibility violation** (button-name). Selector `button.search-button` may be the only CSS option but is fragile.

- **#24** (`div[role="none"].wwXWniyIkpZyUiwBCyhA`): Hidden div with role="none" and only an obfuscated CSS class. No meaningful identity attributes whatsoever.

- **#15–#20** (Konfiguration sub-nav links — Übersicht, Abschlussgründe, Aufgaben, Gruppen, Regime, Aktivitäten Setup): All have only obfuscated class `DQGQ7gJDRoOOez2DJb5h` plus visible text. DOM paths are extremely long (deeply nested in Mashroom portal wrappers). `getByRole('link', { name: /.../ })` is the recommended approach; `aria-current="page"` available only on the active item.

- **#9–#14** (D2D top-level nav links — Baulose, Objekte, Sales Action, etc.): Only have `data-discover="true"` as a data attribute (not a testid). DOM paths are deeply nested. `getByRole('link', { name: /.../ })` is reliable since labels are unique.

## Missing Stable Attributes

All 27 elements lack `data-testid`. The following need the most urgent attention:

| Element | Issue | Recommended Fix |
|---|---|---|
| `button.search-button` (#23) | Icon-only; no text, no aria-label, no id | Add `aria-label="Suche"` AND `data-testid="tasks-search-button"` |
| `div[role="none"]` (#24) | No identity at all; hidden element | Add `data-testid` if it needs to be tested, otherwise mark as test-excluded |
| `button.normal.link` "Aufgabe erstellen" (#21) | No data-testid | Add `data-testid="create-task-button"` |
| `input#sales-action-tasks-search-field` (#22) | Has id but no data-testid | Add `data-testid="tasks-search-input"` to complement existing id |
| All Konfiguration sub-nav links (#15–#20) | No data-testid; obfuscated class names | Add `data-testid="konfig-nav-{slug}"` per link |
| All D2D top-level nav links (#9–#14) | No data-testid | Add `data-testid="d2d-nav-{slug}"` per link |
