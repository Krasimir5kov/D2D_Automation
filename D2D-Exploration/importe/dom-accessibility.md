# DOM & Accessibility — Importe

## Source

- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/imports/imports-list/default/accessibility-report.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/imports/imports-list/default/sanitized-dom.html`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/imports/imports-list/default/IMPROVEMENTS.md`
- `/sessions/sweet-optimistic-turing/mnt/D2D-App-DOM-Inspector/app-inspection/output/accessibility/importe-main.txt`
- `/sessions/sweet-optimistic-turing/mnt/D2D-App-DOM-Inspector/app-inspection/output/pages/importe.md`

---

## Accessibility Tree

**Tested by:** axe-core 4.11.4  
**Timestamp:** 2026-06-03T18:14:50.484Z  
**URL:** `https://portal-int.open-frontends.a1.net/door2door#/importe`

### Summary

| Category | Count |
|---|---|
| Violations | 9 |
| Passes | 42 |
| Incomplete (needs manual review) | 1 |
| Inapplicable | 44 |

### Violations

| # | Rule ID | Impact | Description | Nodes Affected |
|---|---|---|---|---|
| 1 | `aria-command-name` | **serious** | Every ARIA button, link and menuitem must have an accessible name | 2 |
| 2 | `button-name` | **critical** | Buttons must have discernible text | 1 |
| 3 | `color-contrast` | **serious** | Foreground/background colors do not meet WCAG 2 AA minimum contrast ratio | 19 |
| 4 | `html-has-lang` | **serious** | `<html>` element must have a lang attribute | 1 |
| 5 | `image-alt` | **critical** | `<img>` elements must have alternative text | 1 |
| 6 | `link-name` | **serious** | Links must have discernible text | 1 |
| 7 | `nested-interactive` | **serious** | Interactive controls must not be nested | 1 |
| 8 | `page-has-heading-one` | **moderate** | Page should contain a level-one heading | 1 |
| 9 | `region` | **moderate** | All page content should be contained by landmarks | 2 |

### Incomplete (Needs Manual Review)

| # | Rule ID | Impact | Description | Nodes |
|---|---|---|---|---|
| 1 | `color-contrast` | serious | Cannot determine contrast — background color could not be resolved | 1 |

### Key Findings

- **2 critical violations:** missing button text (`button-name`) and missing image alt text (`image-alt`).
- **Color contrast** is the most widespread issue: 19 nodes failing, plus 1 inconclusive.
- **Nested interactive controls** found — the sortable column filter buttons (`Importdatum`, `Organisation`, `Benutzer`) each contain a nested `<button>` inside an outer `<button>`.
- **No `lang` attribute** on `<html>` — affects screen-reader language detection.
- **No `<h1>`** on the page — fails heading hierarchy check.
- **2 nodes not contained by landmarks** (`region` rule) — content outside `<main>`, `<nav>`, etc.
- **Zero data-testid attributes** present anywhere on the page.

---

## Key DOM Structure

### Page skeleton (reconstructed from accessibility tree + sanitized DOM)

```html
<!DOCTYPE html>
<html>
<!-- NOTE: No lang attribute — accessibility violation -->
<head>
  <meta charset="utf-8">
  <title>Door 2 Door</title>
  <!-- Portal theme CSS, FontAwesome, Mashroom portal scripts -->
</head>
<body>

  <!-- Top banner -->
  <header role="banner">
    Environment: integration  |  Portal Version: 1.28.30
    <a href="javascript:void(0)">Widget Versions</a>
    Krasimir Petkov
    <img />  <!-- MISSING alt — critical violation -->
  </header>

  <main>

    <!-- Portal-level top navigation -->
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="" class="nav-link active">Door 2 Door</a></li>
        <li><a href="/timey" class="nav-link">Timey</a></li>
        <li><a href="/leistungspositionen" class="nav-link">Cockpit-Leistungspositionen</a></li>
        <li><a href="/case_comments" class="nav-link">Case Comments</a></li>
        <li><a href="/CaseDocumentViewer" class="nav-link">Case Document Viewer</a></li>
        <li><a href="/address_list" class="nav-link">Address List</a></li>
      </ul>
    </nav>

    <!-- D2D sidebar navigation -->
    <ul>
      <li>D2D</li>
      <li><a href="#/baulose">Baulose</a></li>
      <li><a href="#/objekte">Objekte</a></li>
      <li><a href="#/sales-actions">Sales Action</a></li>
      <li><a href="#/benutzerverwaltung">Benutzerverwaltung</a></li>
      <li><a href="#/importe">Importe</a></li>
      <li><a href="#/konfiguration">Konfiguration</a></li>
    </ul>

    <!-- Importe page content -->
    <div>

      <!-- Context bar -->
      <span>Krasimir Petkov  Pseudo A1 Organization</span>

      <!-- Search bar -->
      <input id="imports-search-field" type="text"
             placeholder="Suche in Importe..." />
      <!-- Icon-only search button — NO accessible name — critical violation -->
      <button class="search-button icon-a1-lupe" type="button"></button>

      <!-- Action toolbar -->
      <button type="button"><img /> Organisation wechseln</button>
      <button type="button"><img /> Daten importieren</button>

      <!-- Import type filter (tab-like buttons) -->
      <button type="button">System Import</button>
      <button type="button">Datei Import</button>

      <!-- Sortable column filter buttons — each contains a NESTED button (violation) -->
      <button type="button">
        Importdatum
        <button><img /></button>
      </button>
      <button type="button">
        Organisation
        <button><img /></button>
      </button>
      <button type="button">
        Benutzer
        <button><img /></button>
      </button>

      <!-- Imports table -->
      <table>
        <thead>
          <tr>
            <th>Import</th>       <!-- date + who imported -->
            <th>Baulos</th>
            <th>Organisation</th>
            <th>Details</th>      <!-- filename or sync status -->
            <th>Aktionen</th>     <!-- Rückgängig machen or empty -->
          </tr>
        </thead>
        <tbody>
          <!-- Manual upload row -->
          <tr>
            <td>17.06.2026 16:50 Krasimir Petkov</td>
            <td>FBB CORT_6 FBB CORT_6</td>
            <td>Network Ost</td>
            <td>Importdateiname FBB_CORT_6_FTTC_bigfile.csv</td>
            <td><button type="button">Rückgängig machen</button></td>
          </tr>
          <!-- System import row (no undo action) -->
          <tr>
            <td>20.04.2026 17:38 System Import</td>
            <td>25_Laubichl_Pfarrwerfen_VHCN_Testteam_BL2 32991</td>
            <td>E2E Team 1.0</td>
            <td>letzter Abgleich mit KI-DB am 21.05.2026 06:00 <img /> erfolgreich</td>
            <td><!-- empty --></td>
          </tr>
          <!-- ... 23 more rows per page ... -->
        </tbody>
      </table>

      <!-- Pagination controls -->
      <span>Datensätze pro Seite</span>
      <button>25</button>          <!-- page-size dropdown trigger -->
      <button></button>            <!-- prev page (icon only) -->
      <span>1-25 von 1386 Datensätzen</span>
      <button>1</button>           <!-- page number dropdown trigger -->
      <span>von 56 Seiten</span>
      <button></button>            <!-- next page (icon only) -->
      <button></button>            <!-- last page (icon only) -->

    </div>
  </main>

  <!-- Auth expiry notice (outside landmarks — region violation) -->
  <span>Due to inactivity, the authentication will expire in 00:00</span>
  <a id="mashroom-portal-auth-expires-extend" href="javascript:void(0)">Extend authentication</a>

  <footer role="contentinfo">
    <a href="https://www.a1.group/">A1 Telekom Austria Group</a>
  </footer>

  <!-- Hidden dropdown menus (page-size and page-number selectors) -->
  <!-- menuitem "25" | "50" | "100" | "500" -->
  <!-- menuitem "1" through "56" -->

</body>
</html>
```

### Notable DOM Observations

- **1386 total records**, paginated at 25/50/100/500 per page, 56 pages total.
- **Two import origin types:**
  - *Manual user uploads* — Aktionen column shows `Rückgängig machen` button.
  - *System Import* — Aktionen column is empty; Details column shows sync timestamp + status icon.
- **Sort/filter column buttons** (`Importdatum`, `Organisation`, `Benutzer`) use a pattern with a nested `<button>` for the sort indicator arrow — this is the `nested-interactive` accessibility violation.
- **Import type filter** (`System Import` / `Datei Import`) appears as plain toggle buttons, no ARIA tabs pattern.
- **Search field** uses `id="imports-search-field"` (differs from Benutzerverwaltung which uses `id="shared-search-field"`).
- **No data-testid attributes anywhere** on the Importe page.
- **Obfuscated CSS class names** throughout (e.g., `_0B5hEHD2NGqp04Q_rRE`) — CSS-modules output, brittle as locators.

---

## Page Notes

*(Full content from IMPROVEMENTS.md)*

---

# UI Improvements - imports / imports-list / default

- Capture type: configured route sweep
- Total interactive elements: 66
- Open shadow roots detected: 0
- Iframes detected: 0

## Accessibility Violations By Rule

- aria-command-name: serious; nodes: 2
- button-name: critical; nodes: 1
- color-contrast: serious; nodes: 19
- html-has-lang: serious; nodes: 1
- image-alt: critical; nodes: 1
- link-name: serious; nodes: 1
- nested-interactive: serious; nodes: 1
- page-has-heading-one: moderate; nodes: 1
- region: moderate; nodes: 2

## Repeated Issues

### Elements with missing labels
- None detected.

### Icon-only controls without meaningful accessible names
- icon-only button: Icon-only control has no meaningful accessible name. Count: 3; priority: High

### Duplicate HTML id values
- None detected.

### CSS-class-only locator risks
- none element: Element currently risks requiring CSS-class-only locators. Count: 1; priority: Medium

### Long DOM-path locator risks
- link: Diagnostic DOM path is long and would be brittle as a locator. Count: 44; priority: Medium
- standard button: Diagnostic DOM path is long and would be brittle as a locator. Count: 3; priority: Medium
- search field: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium

### Generic div elements that behave like buttons
- standard button: Generic div behaves like a button; prefer a native button. Count: 3; priority: High

### Custom dropdown-like components
- None detected.

## Existing Useful Data-testid Values
- None detected.

## Missing Recommended Data-testid Values
- icon-only button: Recommended locator: `page.getByRole('button', { name: /Suchen/i })` (requires aria-label fix)
- icon-only button: Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- none element: Recommended locator: `page.getByRole('none', { name: /Meaningful control name/i })`

## Representative Recommendations

### search field - Medium
Current: `<input id="imports-search-field" type="text" autocomplete="off" value="[REDACTED]">`
Recommended: Add label and change type to search.
Locator: `page.getByLabel("Suche in Importe...")`

### icon-only button - High
Current: `<button class="search-button icon-a1-lupe" type="button"></button>`
Recommended: `<button type="button" aria-label="Suchen" data-testid="d2d-importe-search-btn"><span class="icon" aria-hidden="true"></span></button>`
Locator: `page.getByRole('button', { name: /Suchen/i })`

### nav links - Medium
All D2D nav links rely on long DOM paths. Recommended: `page.getByRole('link', { name: /Importe/i })`

### standard buttons - Medium
- `page.getByRole('button', { name: /Benutzer erstellen/i })`
- `page.getByRole('button', { name: /Team erstellen/i })`
- `page.getByRole('button', { name: /Admin A1 erstellen/i })`

*(Note: these create buttons are from Benutzerverwaltung panel loaded in the same DOM snapshot.)*
