# Buttons & Locators — Gruppen (Groups)

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
| 21 | _(none/hidden)_ | div | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 22 | Extend authentication | a | no | no | yes | no | YES | `page.locator('#mashroom-portal-auth-expires-extend')` |
| 23 | A1 Telekom Austria Group | a | no | no | no | no | NO | `page.getByRole('link', { name: /A1 Telekom Austria Group/i })` |

**Total elements:** 24  
**With stable locators:** 1 (element #22 has id `mashroom-portal-auth-expires-extend`)  
**Without stable locators:** 23 — rely on visible text, role, or long DOM path

## Locator Quality Issues

The following elements currently rely only on CSS class or position for differentiation:

- **#21** (`div[role="none"].wwXWniyIkpZyUiwBCyhA`): Hidden div with role="none" and only an obfuscated CSS class. No meaningful identity attributes whatsoever. This element has no visible text and no accessible name — it appears to be a layout/slot element.

- **#15–#20** (Konfiguration sub-nav links — Übersicht, Abschlussgründe, Aufgaben, Gruppen, Regime, Aktivitäten Setup): All have only obfuscated class `DQGQ7gJDRoOOez2DJb5h` plus visible text. DOM paths are extremely long (deeply nested in Mashroom portal wrappers). `getByRole('link', { name: /.../ })` is the recommended approach; `aria-current="page"` available only on the active item (Gruppen on this page).

- **#9–#14** (D2D top-level nav links — Baulose, Objekte, Sales Action, etc.): Only have `data-discover="true"` as a data attribute (not a testid). DOM paths are deeply nested. `getByRole('link', { name: /.../ })` is reliable since labels are unique.

## Missing Stable Attributes

All 24 elements lack `data-testid`. The following need the most urgent attention:

| Element | Issue | Recommended Fix |
|---|---|---|
| `div[role="none"]` (#21) | No identity at all; hidden element | Add `data-testid` if it needs testing, otherwise mark as test-excluded |
| All Konfiguration sub-nav links (#15–#20) | No data-testid; obfuscated class names | Add `data-testid="konfig-nav-{slug}"` per link (e.g., `konfig-nav-gruppen`) |
| All D2D top-level nav links (#9–#14) | No data-testid | Add `data-testid="d2d-nav-{slug}"` per link |

**Note:** The Gruppen page has no "create" button or search field visible in the captured state, unlike Aufgaben which has both. This means Gruppen has fewer critical locator gaps — the only button-type concern is the hidden none-role div.
