# Buttons & Locators — Konfiguration / Regime

## Button Inventory

| # | Visible Label | Tag | data-testid | aria-label | id | name | Stable? | Recommended Locator |
|---|--------------|-----|------------|-----------|-----|------|---------|---------------------|
| 1 | Widget Versions | a | no | no | no | no | NO | `page.getByRole('link', { name: /Widget Versions/i })` |
| 2 | Abmelden | a | no | no | no | no | NO | `page.getByRole('link', { name: /Abmelden/i })` |
| 3 | Home | a | no | no | no | no | NO | `page.getByRole('link', { name: /Home/i })` |
| 4 | Door 2 Door | a | no | no | no | no | NO | `page.getByRole('link', { name: /Door 2 Door/i })` |
| 5 | Timey | a | no | no | no | no | NO | `page.getByRole('link', { name: /Timey/i })` |
| 6 | Cockpit-Leistungspositionen | a | no | no | no | no | NO | `page.getByRole('link', { name: /Cockpit-Leistungspositionen/i })` |
| 7 | Case Comments | a | no | no | no | no | NO | `page.getByRole('link', { name: /Case Comments/i })` |
| 8 | Case Document Viewer | a | no | no | no | no | NO | `page.getByRole('link', { name: /Case Document Viewer/i })` |
| 9 | Address List | a | no | no | no | no | NO | `page.getByRole('link', { name: /Address List/i })` |
| 10 | Baulose | a | no | no | no | no | NO | `page.getByRole('link', { name: /Baulose/i })` |
| 11 | Objekte | a | no | no | no | no | NO | `page.getByRole('link', { name: /Objekte/i })` |
| 12 | Sales Action | a | no | no | no | no | NO | `page.getByRole('link', { name: /Sales Action/i })` |
| 13 | Benutzerverwaltung | a | no | no | no | no | NO | `page.getByRole('link', { name: /Benutzerverwaltung/i })` |
| 14 | Importe | a | no | no | no | no | NO | `page.getByRole('link', { name: /Importe/i })` |
| 15 | Konfiguration | a | no | no | no | no | NO | `page.getByRole('link', { name: /Konfiguration/i })` |
| 16 | Ubersicht | a | no | no | no | no | NO | `page.getByRole('link', { name: /Ubersicht/i })` |
| 17 | Abschlussgrunde | a | no | no | no | no | NO | `page.getByRole('link', { name: /Abschlussgrunde/i })` |
| 18 | Aufgaben | a | no | no | no | no | NO | `page.getByRole('link', { name: /Aufgaben/i })` |
| 19 | Gruppen | a | no | no | no | no | NO | `page.getByRole('link', { name: /Gruppen/i })` |
| 20 | Regime | a | no | no | no | no | NO | `page.getByRole('link', { name: /Regime/i })` |
| 21 | Aktivitaten Setup | a | no | no | no | no | NO | `page.getByRole('link', { name: /Aktivitaten Setup/i })` |
| 22 | Regime erstellen | button | no | no | no | no | NO | `page.getByRole('button', { name: /Regime erstellen/i })` |
| 23 | (search input) | input | no | no | yes | no | YES | `#regime-search-field` |
| 24 | (search icon btn) | button | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 25 | Neubau | div | no | no | no | no | NO | `page.getByRole('button', { name: /Neubau/i })` |
| 26 | FTTH-Ausbau | div | no | no | no | no | NO | `page.getByRole('button', { name: /FTTH-Ausbau/i })` |
| 27 | Bestandsbau | div | no | no | no | no | NO | `page.getByRole('button', { name: /Bestandsbau/i })` |
| 28-129 | (icon-only row action buttons) | div | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR — add aria-label or data-testid */` |
| 130 | (unnamed divs) | div | no | no | no | no | NO | `/* NEEDS STABLE LOCATOR */` |
| 131 | Extend authentication | a | no | no | yes | no | YES | `#mashroom-portal-auth-expires-extend` |
| 132 | A1 Telekom Austria Group | a | no | no | no | no | NO | `page.getByRole('link', { name: /A1 Telekom Austria Group/i })` |

> Note: Elements 28-129 are icon-only row action buttons (each table row has 2 icon buttons).
> None have accessible names, data-testid, aria-label, or id.

---

## Locator Quality Issues

Elements with NO stable locator (no data-testid, no aria-label, no id):

- **#22 `Regime erstellen` button** — primary page action; critical to add `data-testid="regime-create-btn"` or aria-label
- **#24 search icon button** — secondary search trigger; add aria-label="Suchen"
- **#25 Neubau filter tab** — div with role=button; add aria-label="Neubau" or data-testid
- **#26 FTTH-Ausbau filter tab** — same issue
- **#27 Bestandsbau filter tab** — same issue
- **#28-129 icon-only row action buttons** — 102 elements, all unlabeled; HIGH PRIORITY — add `aria-label` per button function (e.g. "Regime bearbeiten", "Regime loschen")
- **#132 A1 Telekom Austria Group footer link** — low priority

---

## Missing Stable Attributes

### Critical Priority
| Element | Count | Recommended Fix |
|---------|-------|----------------|
| Row action buttons (icon-only) | 68 | Add `aria-label` per action type (edit/delete/view) |
| Button "Regime erstellen" | 1 | Add `data-testid="regime-create-btn"` |

### Medium Priority
| Element | Count | Recommended Fix |
|---------|-------|----------------|
| Filter tab divs (Neubau, FTTH-Ausbau, Bestandsbau) | 3 | Convert to native `<button>` + add `aria-label` |
| Search clear/icon button | 1 | Add `aria-label="Suchen"` |
| Table rows | 34 | Add `data-testid` with row identifier (e.g. regime ID) |

### Notes
- Only 2 elements have stable locators: `#regime-search-field` (id) and `#mashroom-portal-auth-expires-extend` (id)
- 0 elements have `data-testid` on this page
- All navigation links (items 1-21) rely on visible text via `getByRole('link', { name: ... })` — acceptable but fragile to label changes
- The 130 unlabeled div elements (items 28-129) are the biggest automation risk on this page
