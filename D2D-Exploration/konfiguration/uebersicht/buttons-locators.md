# Buttons & Locators — Konfiguration / Übersicht

## Button Inventory

| # | Visible Label | Tag | Has data-testid | Has aria-label | Has id | Has name | Stable Locator? | Recommended Locator |
|---|---|---|---|---|---|---|---|---|
| 1 | Widget Versions | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 2 | Abmelden | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 3 | Home | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 4 | Door 2 Door | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 5 | Timey | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 6 | Cockpit-Leistungspositionen | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 7 | Case Comments | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 8 | Case Document Viewer | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 9 | Address List | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 10 | Baulose | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 11 | Objekte | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 12 | Sales Action | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 13 | Benutzerverwaltung | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 14 | Importe | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 15 | Konfiguration | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 16 | Übersicht | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 17 | Abschlussgründe | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 18 | Aufgaben | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 19 | Gruppen | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 20 | Regime | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 21 | Aktivitäten Setup | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 22 |  | div | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 23 | Extend authentication | a | no | no | yes | no | YES | `#mashroom-portal-auth-expires-extend` |
| 24 | A1 Telekom Austria Group | a | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |

**Totals:** 24 elements — 1 stable (4%), 23 unstable

## Locator Quality Issues

- Row 1: `Widget Versions` (a) — no testid/aria/id, relies on CSS class or position
- Row 2: `Abmelden` (a) — no testid/aria/id, relies on CSS class or position
- Row 3: `Home` (a) — no testid/aria/id, relies on CSS class or position
- Row 4: `Door 2 Door` (a) — no testid/aria/id, relies on CSS class or position
- Row 5: `Timey` (a) — no testid/aria/id, relies on CSS class or position
- Row 6: `Cockpit-Leistungspositionen` (a) — no testid/aria/id, relies on CSS class or position
- Row 7: `Case Comments` (a) — no testid/aria/id, relies on CSS class or position
- Row 8: `Case Document Viewer` (a) — no testid/aria/id, relies on CSS class or position
- Row 9: `Address List` (a) — no testid/aria/id, relies on CSS class or position
- Row 10: `Baulose` (a) — no testid/aria/id, relies on CSS class or position
- Row 11: `Objekte` (a) — no testid/aria/id, relies on CSS class or position
- Row 12: `Sales Action` (a) — no testid/aria/id, relies on CSS class or position
- Row 13: `Benutzerverwaltung` (a) — no testid/aria/id, relies on CSS class or position
- Row 14: `Importe` (a) — no testid/aria/id, relies on CSS class or position
- Row 15: `Konfiguration` (a) — no testid/aria/id, relies on CSS class or position
- Row 16: `Übersicht` (a) — no testid/aria/id, relies on CSS class or position
- Row 17: `Abschlussgründe` (a) — no testid/aria/id, relies on CSS class or position
- Row 18: `Aufgaben` (a) — no testid/aria/id, relies on CSS class or position
- Row 19: `Gruppen` (a) — no testid/aria/id, relies on CSS class or position
- Row 20: `Regime` (a) — no testid/aria/id, relies on CSS class or position
- Row 21: `Aktivitäten Setup` (a) — no testid/aria/id, relies on CSS class or position
- Row 22: `(no text)` (div) — no testid/aria/id, relies on CSS class or position
- Row 24: `A1 Telekom Austria Group` (a) — no testid/aria/id, relies on CSS class or position

**Note for named links:** Playwright `page.getByRole('link', { name: /text/i })` gives a
reasonably stable fallback for rows 3–21 even without a data-testid.

## Missing Stable Attributes

- Row 1: `Widget Versions` (a)
- Row 2: `Abmelden` (a)
- Row 3: `Home` (a)
- Row 4: `Door 2 Door` (a)
- Row 5: `Timey` (a)
- Row 6: `Cockpit-Leistungspositionen` (a)
- Row 7: `Case Comments` (a)
- Row 8: `Case Document Viewer` (a)
- Row 9: `Address List` (a)
- Row 10: `Baulose` (a)
- Row 11: `Objekte` (a)
- Row 12: `Sales Action` (a)
- Row 13: `Benutzerverwaltung` (a)
- Row 14: `Importe` (a)
- Row 15: `Konfiguration` (a)
- Row 16: `Übersicht` (a)
- Row 17: `Abschlussgründe` (a)
- Row 18: `Aufgaben` (a)
- Row 19: `Gruppen` (a)
- Row 20: `Regime` (a)
- Row 21: `Aktivitäten Setup` (a)
- Row 22: `(no text)` (div)
- Row 24: `A1 Telekom Austria Group` (a)

**Priority additions:**
- Row 22 `(no text)` div — no visible text either; needs aria-label AND data-testid to be testable at all.
- Rows 1–2 (`Widget Versions`, `Abmelden`) — add `data-testid="nav-widget-versions"` / `data-testid="nav-logout"`.
- Rows 16–21 Konfiguration sub-nav tabs — add `data-testid="konfig-tab-uebersicht"` etc.
