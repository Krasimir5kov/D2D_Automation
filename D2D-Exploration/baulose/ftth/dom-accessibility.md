# DOM & Accessibility — Baulose FTTH List

## Source

- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/baulose/ftth-list/default/accessibility-report.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/baulose/ftth-list/default/interactive-elements.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/baulose/ftth-list/default/sanitized-dom.html`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/baulose/ftth-list/default/IMPROVEMENTS.md`
- `/sessions/sweet-optimistic-turing/mnt/D2D-App-DOM-Inspector/app-inspection/output/accessibility/baulose-main.txt`
- `/sessions/sweet-optimistic-turing/mnt/D2D-App-DOM-Inspector/app-inspection/output/pages/baulose.md`

**Captured:** 2026-06-03T18:26:37.566Z  
**URL:** `https://portal-int.open-frontends.a1.net/door2door#/baulose/ftth`  
**Test engine:** axe-core v4.11.4 | Window: 1280x720  
**Total interactive elements:** 71 | Shadow roots: 0 | Iframes: 0

---

## Accessibility Tree

Abridged accessibility tree from `baulose-main.txt`:

```
- banner:
  - text: "Environment: integration Portal Version: 1.28.30,"
  - link "Widget Versions"
  - text: Krasimir Petkov
  - img

- main:
  - navigation:
    - link "Home"                        /url: /
    - link "Door 2 Door"
    - link "Timey"                       /url: /timey
    - link "Cockpit-Leistungspositionen"
    - link "Case Comments"
    - link "Case Document Viewer"
    - link "Address List"
  - list (D2D app nav):
    - listitem: D2D
    - link "Baulose"             /url: #/baulose
    - link "Objekte"             /url: #/objekte
    - link "Sales Action"        /url: #/sales-actions
    - link "Benutzerverwaltung"
    - link "Importe"
    - link "Konfiguration"
  - text: Krasimir Petkov | Pseudo A1 Organization | Suche nach Baulose/Einsatznamen...
  - textbox "Suche nach Baulose/Einsatznamen..."   id=baulose-search-field
  - button ""          (icon-only search — no accessible name)
  - button "Organisation"  (sortable column header — contains nested button)
  - button "Regime"        (sortable column header — contains nested button)
  - button "Phase"         (sortable column header — contains nested button)
  - button "Status"        (sortable column header — contains nested button)
  - link "FTTH-AUSBAU (3)"     /url: #/baulose/ftth
  - link "BESTANDSBAU (3)"     /url: #/baulose/bestandsbau
  - table:
    - rowgroup (thead):
      - row: "Baulos / Regime | Organisation / Phase | Status | Pre-Contracting | 2nd Run | Anzahl"
    - rowgroup (tbody):
      - row: "24_Göttlesbrunn_2_VULL_Testteam _BL11 26416 vULL 2.0 | Network Nord Keine Phase | CLOSED | Start: 25.05.2024 Ende: 15.10.2024 | kein 2nd Run | D2D SA: 517 PE: 61 → button 'zu Sales Actions'"
      - row: "23_Grieskirchen_BL1 23718 VHCN | NMAV NÖ 1 Keine Phase | CLOSED | Start: 11.05.2023 Ende: 03.08.2023 | kein 2nd Run | D2D SA: 607 PE: 730 → button 'zu Sales Actions'"
      - row: "24_Fantsch_Gleinstätten_S2ATestteam_BL1 25805 VHCN | NMAV NÖ 2 2nd Run | CLOSED | Start: 01.01.2024 Ende: 15.01.2024 | Start: 31.05.2023 Ende: 26.05.2024 | D2D SA: 5 PE: 5 → button 'zu Sales Actions'"
  - text: Datensätze pro Seite
  - button "25"        (pagination page-size selector)
  - button ""          (pagination dropdown arrow — no accessible name)
  - text: 1-3 von 3 Datensätzen
  - button "1"         (current page)
  - button ""          (next page — no accessible name)
  - text: von 1 Seiten
  - button ""          (first page — no accessible name)
  - button ""          (last page — no accessible name)

- text: Due to inactivity, the authentication will expire in 00:00
- link "Extend authentication"
- contentinfo:
  - link "A1 Telekom Austria Group"

- menuitem "25"    (pagination dropdown — outside landmark)
- menuitem "50"
- menuitem "100"
- menuitem "500"
```

---

### Violations (9)

| # | ID | Impact | Nodes | Description |
|---|---|---|---|---|
| 1 | `aria-command-name` | **serious** | 8 | ARIA buttons/links/menuitems must have an accessible name |
| 2 | `aria-required-parent` | **critical** | 35 | `role="menuitem"` elements missing required parent (`menu`/`menubar`/`group`) |
| 3 | `button-name` | **critical** | 1 | `<button class="search-button icon-a1-lupe">` has no discernible text |
| 4 | `color-contrast` | **serious** | 104 | Multiple elements fail WCAG 2 AA contrast ratio (4.5:1) |
| 5 | `html-has-lang` | **serious** | 1 | `<html>` element is missing `lang` attribute |
| 6 | `image-alt` | **critical** | 1 | A1 logo `<img>` has no `alt` attribute |
| 7 | `nested-interactive` | **serious** | 4 | Column-header `div[role="button"]` elements contain focusable child buttons |
| 8 | `page-has-heading-one` | moderate | 1 | Page contains no `<h1>` heading |
| 9 | `region` | moderate | 4 | Portal overlay/modal divs and dropdown sit outside landmark regions |

**Summary by severity:**
- Critical (3): `aria-required-parent` (35 nodes), `button-name` (1 node), `image-alt` (1 node)
- Serious (4): `color-contrast` (104 nodes), `aria-command-name` (8 nodes), `nested-interactive` (4 nodes), `html-has-lang` (1 node)
- Moderate (2): `page-has-heading-one`, `region`

#### Notable violation details

**`color-contrast` (104 nodes) — worst offenders:**
- `.user-name` text — contrast 4.31 (fg: `#da291c` on `#000000`, 14px bold). Required: 4.5:1
- Placeholder "Suche nach Baulose/Einsatznamen..." — contrast 1.91 (fg: `#bbbbbb` on `#ffffff`, 15.75px). Required: 4.5:1
- "2nd Run" badge — contrast 2.39 (fg: `#ffffff` on `#e59700`, 12px). Required: 4.5:1

**`aria-required-parent` (35 nodes):**
- Pagination dropdown options use `role="menuitem"` without an enclosing `role="menu"` container
- Example: `<div tabindex="-1" role="menuitem" class="option selected"><span>25</span></div>`

**`nested-interactive` (4 nodes):**
- Each column header is `<div tabindex="0" role="button" class="HePyFz5n_qN7wvTgUrv1">` containing a child `div[role="button"]` sort icon — both are focusable

---

### Passes (41)

| ID | Nodes | Help |
|---|---|---|
| aria-allowed-attr | 1 | Elements must only use supported ARIA attributes |
| aria-allowed-role | 50 | ARIA role should be appropriate for the element |
| aria-command-name | 41 | ARIA commands must have an accessible name |
| aria-conditional-attr | 1 | ARIA attributes must be used as specified for the element's role |
| aria-deprecated-role | 49 | Deprecated ARIA roles must not be used |
| aria-hidden-body | 1 | aria-hidden="true" must not be present on the document body |
| aria-prohibited-attr | 1 | Elements must only use permitted ARIA attributes |
| aria-required-attr | 49 | Required ARIA attributes must be provided |
| aria-roles | 49 | ARIA roles used must conform to valid values |
| aria-valid-attr-value | 1 | ARIA attributes must conform to valid values |
| aria-valid-attr | 1 | ARIA attributes must conform to valid names |
| autocomplete-valid | 1 | autocomplete attribute must be used correctly |
| avoid-inline-spacing | 157 | Inline text spacing must be adjustable with custom stylesheets |
| bypass | 1 | Page must have means to bypass repeated blocks |
| color-contrast | 241 | Elements meet minimum color contrast thresholds |
| document-title | 1 | Documents must have `<title>` element |
| duplicate-id-aria | 1 | IDs used in ARIA and labels must be unique |
| form-field-multiple-labels | 1 | Form field must not have multiple label elements |
| image-redundant-alt | 1 | Alt text of images should not be repeated as text |
| label-title-only | 1 | Form elements should have a visible label |
| label | 1 | Form elements must have labels |
| landmark-banner-is-top-level | 1 | Banner landmark should not be contained in another landmark |
| landmark-contentinfo-is-top-level | 1 | Contentinfo landmark should not be contained in another landmark |
| landmark-main-is-top-level | 1 | Main landmark should not be contained in another landmark |
| landmark-no-duplicate-banner | 1 | Document should not have more than one banner landmark |
| landmark-no-duplicate-contentinfo | 1 | Document should not have more than one contentinfo landmark |
| landmark-no-duplicate-main | 1 | Document should not have more than one main landmark |
| landmark-one-main | 1 | Document should have one main landmark |
| landmark-unique | 4 | Landmarks should have a unique role or role/label/title combination |
| link-in-text-block | 1 | Links must be distinguishable without relying on color |
| link-name | 18 | Links must have discernible text |
| list | 2 | `<ul>` and `<ol>` must only directly contain `<li>` elements |
| listitem | 14 | `<li>` elements must be contained in `<ul>` or `<ol>` |
| meta-viewport-large | 1 | Users should be able to zoom and scale text up to 500% |
| meta-viewport | 1 | Zooming and scaling must not be disabled |
| nested-interactive | 12 | Interactive controls must not be nested |
| region | 1053 | All page content should be contained by landmarks |
| tabindex | 49 | Elements should not have tabindex greater than zero |
| table-duplicate-name | 1 | Tables should not have the same summary and caption |
| td-headers-attr | 1 | Table cell headers must refer to other `<th>` elements |
| th-has-data-cells | 1 | Table headers must refer to data cells |

---

### Incomplete (1)

| ID | Impact | Nodes | Note |
|---|---|---|---|
| `color-contrast` | serious | 1 | `<input id="baulose-search-field">` — background color could not be determined (element is overlapped) |

---

### Inapplicable (43)

accesskeys, area-alt, aria-braille-equivalent, aria-dialog-name, aria-hidden-focus, aria-input-field-name, aria-meter-name, aria-progressbar-name, aria-required-children, aria-text, aria-toggle-field-name, aria-tooltip-name, aria-treeitem-name, blink, definition-list, dlitem, empty-heading, empty-table-header, frame-focusable-content, frame-tested, frame-title-unique, frame-title, heading-order, html-lang-valid, html-xml-lang-mismatch, input-button-name, input-image-alt, landmark-complementary-is-top-level, marquee, meta-refresh, object-alt, presentation-role-conflict, role-img-alt, scope-attr-valid, scrollable-region-focusable, select-name, server-side-image-map, skip-link, summary-name, svg-img-alt, valid-lang, video-caption, no-autoplay-audio

---

## Key DOM Structure

Extracted structural landmarks from `sanitized-dom.html` (149 KB):

```html
<!-- Portal shell -->
<header>
  <!-- A1 logo, environment label, user name, Widget Versions link -->
</header>

<main>
  <!-- Portal-level navigation -->
  <nav>
    <!-- Home, Door 2 Door, Timey, Cockpit-Leistungspositionen, Case Comments,
         Case Document Viewer, Address List -->
  </nav>

  <!-- D2D sidebar navigation -->
  <div class="navigation">
    <ul>
      <li>D2D</li>
      <li><a href="#/baulose">Baulose</a></li>
      <li><a href="#/objekte">Objekte</a></li>
      <li><a href="#/sales-actions">Sales Action</a></li>
      <li><a href="#/benutzerverwaltung">Benutzerverwaltung</a></li>
      <li><a href="#/importe">Importe</a></li>
      <li><a href="#/konfiguration">Konfiguration</a></li>
    </ul>
  </div>

  <!-- Main content area -->
  <div class="mashroom-portal-apps-container container-fluid">
    <div class="mashroom-portal-app-header">
      <div data-mr-app-content="title" class="mashroom-portal-app-header-title">
        <!-- Page title -->
      </div>
    </div>

    <!-- Search + filter toolbar -->
    <div class="flexed-container primary">
      <input id="baulose-search-field" type="text" autocomplete="off" spellcheck="false">
      <button class="search-button icon-a1-lupe" type="button"></button>
      <!-- 4 filter dropdowns — Organisation, Regime, Phase, Status -->
      <!-- Each uses the pattern: -->
      <div tabindex="0" role="button" class="HePyFz5n_qN7wvTgUrv1">
        LABEL
        <div class="gucci-icon-button-v2 secondary" role="button" tabindex="0">
          <!-- chevron/arrow SVG icon -->
        </div>
      </div>
    </div>

    <!-- FTTH / Bestandsbau tab switcher -->
    <a href="#/baulose/ftth">FTTH-AUSBAU (3)</a>
    <a href="#/baulose/bestandsbau">BESTANDSBAU (3)</a>

    <!-- Baulose list table -->
    <table>
      <thead>
        <tr>
          <th>Baulos / Regime</th>
          <th>Organisation / Phase</th>
          <th>Status</th>
          <th>Pre-Contracting</th>
          <th>2nd Run</th>
          <th>Anzahl</th>
        </tr>
      </thead>
      <tbody>
        <!-- 3 data rows (test data), each with:
             col1: Baulos name + Regime badge
             col2: Organisation + Phase
             col3: Status chip (e.g. CLOSED)
             col4: Pre-Contracting date range
             col5: 2nd Run date range or "kein 2nd Run"
             col6: "D2D SA: N PE: N" + <button>zu Sales Actions</button>
        -->
      </tbody>
    </table>

    <!-- Pagination controls -->
    <div class="gucci-common-page-navigator-extended gucci-spacing-standard" id="page-navigator">
      <div class="gucci-common-page-navigator-items-selection">
        <!-- "Datensätze pro Seite" + page-size dropdown -->
      </div>
      <div class="gucci-common-page-navigator-page-selection">
        <div class="gucci-common-page-navigator-page-selection-content">
          <!-- "1-3 von 3 Datensätzen" -->
        </div>
        <div class="gucci-common-page-navigator-page-selection-buttons">
          <!-- first / prev / page-number / next / last buttons -->
        </div>
      </div>
    </div>

    <!-- Side-panel entry point -->
    <div data-testid="microflow-wrapper">
      <!-- Sales Action / detail panels rendered here -->
    </div>
  </div>
</main>

<!-- Outside landmarks (portal overlays) -->
<div id="mashroom-portal-auth-expires-warning">
  <!-- "Due to inactivity..." + Extend authentication link -->
</div>
<div id="mashroom-portal-modal-overlay"></div>

<!-- Pagination page-size dropdown (rendered outside landmarks) -->
<div class="gucci-common-select-field-drop-down in-portal">
  <div role="menuitem" class="option selected"><span>25</span></div>
  <div role="menuitem" class="option"><span>50</span></div>
  <div role="menuitem" class="option"><span>100</span></div>
  <div role="menuitem" class="option"><span>500</span></div>
</div>

<footer>
  <a href="https://www.a1.group/">A1 Telekom Austria Group</a>
</footer>
```

**Structural notes:**
- Only one `data-testid` present on the entire page: `data-testid="microflow-wrapper"` (side-panel container)
- Column-header sort controls are `div[role="button"]` with obfuscated CSS class `HePyFz5n_qN7wvTgUrv1` — not native `<button>` elements
- Pagination dropdown options use `role="menuitem"` without an enclosing `role="menu"` parent (causes `aria-required-parent` violations)
- The page-size dropdown portal (`gucci-common-select-field-drop-down.in-portal`) is appended outside the `<main>` landmark

---

## Page Notes

From `IMPROVEMENTS.md`:

**Capture type:** configured route sweep  
**Total interactive elements:** 71  
**Open shadow roots detected:** 0  
**Iframes detected:** 0  

### Accessibility Violations By Rule

| Rule | Impact | Nodes |
|---|---|---|
| aria-command-name | serious | 8 |
| aria-required-parent | critical | 35 |
| button-name | critical | 1 |
| color-contrast | serious | 104 |
| html-has-lang | serious | 1 |
| image-alt | critical | 1 |
| nested-interactive | serious | 4 |
| page-has-heading-one | moderate | 1 |
| region | moderate | 4 |

### Repeated Issues

**Icon-only controls without accessible names** — Count: 9; Priority: High

**CSS-class-only locator risks** — Count: 1; Priority: Medium

**Long DOM-path locator risks:**
- `link` — Count: 8; Priority: Medium
- `search field` — Count: 1; Priority: Medium

**Generic divs that behave like buttons:**
- `standard button` (column headers) — Count: 4; Priority: High
- `dropdown trigger` — Count: 2; Priority: High

**Custom dropdown-like components:**
- `dropdown option` — Count: 33; Priority: Medium
- `dropdown trigger` — Count: 2; Priority: Medium

### Existing Useful data-testid Values
None detected.

### Missing Recommended data-testid Values
- `icon-only button` (×9): `page.getByRole('button', { name: /Describe action/i })`
- `none element` (×1): `page.getByRole('none', { name: /Meaningful control name/i })`

### Representative Recommendations

**Search field (Medium)**  
Current: `<input id="baulose-search-field" type="text" autocomplete="off" spellcheck="false">`  
Fix: Add `<label for="baulose-search-field">Suche nach Baulose/Einsatznamen...</label>` and change type to `search`  
Locator: `page.getByLabel("Suche nach Baulose/Einsatznamen...")`

**Icon-only search button (High)**  
Current: `<button class="search-button icon-a1-lupe" type="button"></button>`  
Fix: Add `aria-label="Suche"` + `data-testid="baulose-search-submit"` + wrap icon in `<span aria-hidden="true">`  
Locator: `page.getByRole('button', { name: /Suche/i })`

**Column header "Organisation" (High)**  
Current: `<div tabindex="0" role="button" class="HePyFz5n_qN7wvTgUrv1">Organisation<div class="gucci-icon-button-v2 secondary" ...>`  
Fix: `<button type="button">Organisation</button>`  
Locator: `page.getByRole('button', { name: /Organisation/i })`

**Column header "Regime" (High)**  
Current: `<div tabindex="0" role="button" class="HePyFz5n_qN7wvTgUrv1">Regime<div ...>`  
Fix: `<button type="button">Regime</button>`  
Locator: `page.getByRole('button', { name: /Regime/i })`

**Navigation links (Medium)**  
All nav links should use `getByRole` — no aria-label or data-testid needed:
- `page.getByRole('link', { name: /Baulose/i })`
- `page.getByRole('link', { name: /Objekte/i })`
- `page.getByRole('link', { name: /Sales Action/i })`
- `page.getByRole('link', { name: /Benutzerverwaltung/i })`
- `page.getByRole('link', { name: /Importe/i })`
- `page.getByRole('link', { name: /Konfiguration/i })`
