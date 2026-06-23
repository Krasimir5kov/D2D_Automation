# Buttons & Locators — Baulose Bestandsbau List

## Button Inventory

| # | Visible Label | Tag | Role | Has data-testid | Has aria-label | Has id | Has name | Visible | Stable Locator? | Recommended Locator |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Widget Versions | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 2 | Abmelden | a | — | no | no | no | no | no | NO | /* NEEDS STABLE LOCATOR */ |
| 3 | Home | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 4 | Door 2 Door | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 5 | Timey | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 6 | Cockpit-Leistungspositionen | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 7 | Case Comments | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 8 | Case Document Viewer | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 9 | Address List | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 10 | Baulose | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 11 | Objekte | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 12 | Sales Action | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 13 | Benutzerverwaltung | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 14 | Importe | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 15 | Konfiguration | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 16 | (search input) Suche nach Baulose/Einsatznamen... | input[text] | — | no | no | yes | no | yes | YES | #baulose-search-field |
| 17 | (icon button — search/lupe) | button | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 18 | Organisation | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 19 | (chevron icon — Organisation) | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 20 | Regime | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 21 | (chevron icon — Regime) | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 22 | Phase | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 23 | (chevron icon — Phase) | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 24 | Status | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 25 | (chevron icon — Status) | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 26 | FTTH-AUSBAU (763) | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 27 | BESTANDSBAU (176) | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 28 | 25 (items per page selector) | div | button | no | no | yes | no | yes | YES | #page-navigator-items-selection-3785 |
| 29 | (items per page dropdown arrow) | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 30 | 1 (page selector) | div | button | no | no | yes | no | yes | YES | #page-navigator-page-selection-3785 |
| 31 | (page dropdown arrow) | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 32 | (prev page arrow — disabled) | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 33 | (next page arrow) | div | button | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 34 | (overlay panel — role=none) | div | none | no | no | no | no | no | NO | /* NEEDS STABLE LOCATOR */ |
| 35 | Extend authentication | a | — | no | no | yes | no | yes | YES | #mashroom-portal-auth-expires-extend |
| 36 | A1 Telekom Austria Group | a | — | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 37 | 25 (dropdown option — selected) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 38 | 50 (dropdown option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 39 | 100 (dropdown option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 40 | 500 (dropdown option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 41 | 1 (page option — selected) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 42 | 2 (page option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 43 | 3 (page option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 44 | 4 (page option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 45 | 5 (page option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 46 | 6 (page option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 47 | 7 (page option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |
| 48 | 8 (page option) | div | menuitem | no | no | no | no | yes | NO | /* NEEDS STABLE LOCATOR */ |

---

## Locator Quality Issues

- Row 1: `a` "Widget Versions" — no stable identifier found; relies on CSS DOM path only
- Row 2: `a` "Abmelden" — no stable identifier found; hidden (visible=false)
- Row 3: `a` "Home" — no stable identifier found; relies on CSS class `nav-link`
- Row 4: `a` "Door 2 Door" — no stable identifier found; relies on CSS classes `nav-link active`
- Row 5: `a` "Timey" — no stable identifier found; relies on CSS class `nav-link`
- Row 6: `a` "Cockpit-Leistungspositionen" — no stable identifier found; relies on CSS class `nav-link`
- Row 7: `a` "Case Comments" — no stable identifier found; relies on CSS class `nav-link`
- Row 8: `a` "Case Document Viewer" — no stable identifier found; relies on CSS class `nav-link`
- Row 9: `a` "Address List" — no stable identifier found; relies on CSS class `nav-link`
- Row 10: `a` "Baulose" — no stable identifier found; only `data-discover="true"` present (non-unique)
- Row 11: `a` "Objekte" — no stable identifier found; only `data-discover="true"` present (non-unique)
- Row 12: `a` "Sales Action" — no stable identifier found; only `data-discover="true"` present (non-unique)
- Row 13: `a` "Benutzerverwaltung" — no stable identifier found; only `data-discover="true"` present (non-unique)
- Row 14: `a` "Importe" — no stable identifier found; only `data-discover="true"` present (non-unique)
- Row 15: `a` "Konfiguration" — no stable identifier found; only `data-discover="true"` present (non-unique)
- Row 17: `button` "(search/lupe icon)" — no label, no id, no data-testid; relies on CSS classes `search-button icon-a1-lupe`
- Row 18: `div` "Organisation" — role=button but uses obfuscated CSS class `HePyFz5n_qN7wvTgUrv1`; no data-testid
- Row 19: `div` "(chevron — Organisation)" — no label, obfuscated CSS classes `gucci-icon-button-v2 secondary`
- Row 20: `div` "Regime" — role=button, obfuscated CSS class, no data-testid
- Row 21: `div` "(chevron — Regime)" — no label, obfuscated CSS classes
- Row 22: `div` "Phase" — role=button, obfuscated CSS class, no data-testid
- Row 23: `div` "(chevron — Phase)" — no label, obfuscated CSS classes
- Row 24: `div` "Status" — role=button, obfuscated CSS class, no data-testid
- Row 25: `div` "(chevron — Status)" — no label, obfuscated CSS classes
- Row 26: `a` "FTTH-AUSBAU (763)" — no stable identifier; tab link relies on position in DOM
- Row 27: `a` "BESTANDSBAU (176)" — no stable identifier; active tab link relies on obfuscated class `HN6lZVrbPmpXBqcxxHZn`
- Row 29: `div` "(items per page dropdown arrow)" — no id, no label, CSS class `gucci-common-select-field-button`
- Row 31: `div` "(page selector dropdown arrow)" — no id, no label, CSS class `gucci-common-select-field-button`
- Row 32: `div` "(prev page — disabled)" — no label, CSS classes `gucci-icon-button-secondary normal disabled`
- Row 33: `div` "(next page)" — no label, CSS classes `gucci-icon-button-secondary normal`
- Row 34: `div` "(overlay panel, role=none)" — invisible, no identifier
- Row 36: `a` "A1 Telekom Austria Group" — footer link; no stable identifier
- Rows 37–48: `div` dropdown option menuitems — no ids, no data-testids; rely entirely on text content + DOM position

---

## Missing Stable Attributes

The following elements need `data-testid` attributes added for reliable test automation:

- Row 1: `a` "Widget Versions" — add `data-testid="widget-versions-link"`
- Row 2: `a` "Abmelden" — add `data-testid="logout-link"`
- Row 10: `a` "Baulose" — add `data-testid="nav-baulose"`
- Row 11: `a` "Objekte" — add `data-testid="nav-objekte"`
- Row 12: `a` "Sales Action" — add `data-testid="nav-sales-action"`
- Row 13: `a` "Benutzerverwaltung" — add `data-testid="nav-benutzerverwaltung"`
- Row 14: `a` "Importe" — add `data-testid="nav-importe"`
- Row 15: `a` "Konfiguration" — add `data-testid="nav-konfiguration"`
- Row 17: `button` "(search icon)" — add `data-testid="baulose-search-button"`
- Row 18: `div` "Organisation" — add `data-testid="filter-organisation"`
- Row 20: `div` "Regime" — add `data-testid="filter-regime"`
- Row 22: `div` "Phase" — add `data-testid="filter-phase"`
- Row 24: `div` "Status" — add `data-testid="filter-status"`
- Row 26: `a` "FTTH-AUSBAU (763)" — add `data-testid="tab-ftth-ausbau"`
- Row 27: `a` "BESTANDSBAU (176)" — add `data-testid="tab-bestandsbau"`
- Row 29: `div` "(items per page dropdown arrow)" — add `data-testid="page-size-dropdown-toggle"`
- Row 31: `div` "(page selector dropdown arrow)" — add `data-testid="page-selector-dropdown-toggle"`
- Row 32: `div` "(prev page button)" — add `data-testid="pagination-prev"`
- Row 33: `div` "(next page button)" — add `data-testid="pagination-next"`

---

## Elements With Stable Locators (Summary)

| Element | Stable Locator |
|---|---|
| Search input (Baulose/Einsatznamen) | `#baulose-search-field` |
| Items-per-page selector | `#page-navigator-items-selection-3785` |
| Page selector | `#page-navigator-page-selection-3785` |
| Extend authentication link | `#mashroom-portal-auth-expires-extend` |

> **Note:** The IDs `page-navigator-items-selection-3785` and `page-navigator-page-selection-3785` contain a dynamic numeric suffix (`3785`). Verify whether this suffix is stable across sessions/reloads before relying on it in automated tests. If it is dynamic, target by partial match: `[id^="page-navigator-items-selection"]` and `[id^="page-navigator-page-selection"]`.

---

## Overall Locator Quality Assessment

- **Total elements:** 48
- **Elements with stable locators (id / data-testid / aria-label):** 4 (8%)
- **Elements with no stable locator:** 44 (92%)
- **Critical gaps:** All navigation links, all filter column headers (Organisation, Regime, Phase, Status), the search icon button, both tab links (FTTH-AUSBAU / BESTANDSBAU), and all pagination controls lack `data-testid` attributes.
- **Obfuscated class names detected:** Several elements use minified/hashed CSS class names (e.g., `HePyFz5n_qN7wvTgUrv1`, `HN6lZVrbPmpXBqcxxHZn`, `ig0nhbKTVdlI5rdxuJMC`) that are not suitable as test locators.
