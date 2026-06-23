# DOM & Accessibility — Sales Actions: FTTH Side Panel

## Source
- `sales-actions/ftth-detail-door-level/side-panel-open/accessibility-report.json`
- `sales-actions/ftth-detail-door-level/side-panel-open/sanitized-dom.html`
- `sales-actions/ftth-detail-door-level/side-panel-open/IMPROVEMENTS.md`

Captured: 2026-06-03T18:33:48Z  
URL: `https://portal-int.open-frontends.a1.net/door2door#/sales-actions/ftth/343802/info?level=DOOR_LEVEL`  
Engine: axe-core 4.11.4

---

## Accessibility Tree

### Violations (11 rules)

| Rule ID | Impact | Node Count |
|---|---|---|
| aria-required-parent | critical | 5680 |
| button-name | critical | 1 |
| image-alt | critical | 1 |
| label | critical | 26 |
| aria-command-name | serious | 93 |
| color-contrast | serious | 102 |
| html-has-lang | serious | 1 |
| link-name | serious | 1 |
| nested-interactive | serious | 42 |
| page-has-heading-one | moderate | 1 |
| region | moderate | 4 |

**Total violation nodes: 5952**

Key patterns:
- `aria-required-parent` (5680 nodes) — massive volume from 5678 custom dropdown option `div` elements that are children of a non-`listbox` container. Every dropdown option in the side panel triggers this.
- `label` (26 nodes) — form controls with no accessible label.
- `color-contrast` (102 nodes) — foreground/background contrast failures.
- `aria-command-name` (93 nodes) — ARIA button/link/menuitem elements with no accessible name (icon-only controls).
- `nested-interactive` (42 nodes) — interactive elements nested inside other interactive elements (e.g. icon button inside a div[role=button]).

### Passes (78 rules)

abstractrole, aria-allowed-attr, aria-allowed-role, aria-conditional-attr, aria-deprecated-role,
aria-errormessage, aria-hidden-body, aria-hidden-focus, aria-level, aria-prohibited-attr,
aria-required-attr, aria-roles, aria-unsupported-attr, aria-valid-attr, aria-valid-attr-value,
autocomplete-valid, avoid-inline-spacing, button-has-visible-text, bypass, color-contrast
(partial), deprecatedrole, doc-has-title, document-title, duplicate-id-aria,
duplicate-img-label, explicit-label, focusable-content, focusable-disabled,
focusable-modal-open, focusable-no-name, focusable-not-tabbable,
form-field-multiple-labels, has-visible-text, hidden-explicit-label, image-redundant-alt,
important-letter-spacing, important-line-height, important-word-spacing, invalidrole,
label (partial), label-title-only, landmark, landmark-banner-is-top-level,
landmark-contentinfo-is-top-level, landmark-is-top-level, landmark-is-unique,
landmark-main-is-top-level, landmark-no-duplicate-banner, landmark-no-duplicate-contentinfo,
landmark-no-duplicate-main, landmark-one-main, landmark-unique, link-in-text-block,
link-name (partial), list, listitem, meta-viewport, meta-viewport-large,
multiple-label, nested-interactive (partial), no-focusable-content, only-listitems,
page-has-main, page-no-duplicate-banner, page-no-duplicate-contentinfo, page-no-duplicate-main,
region (partial), same-caption-summary, scrollable-region-focusable, tabindex,
table-duplicate-name, td-headers-attr, th-has-data-cells, title-only, unsupportedrole

### Incomplete (1 rule)

| Rule ID | Impact | Note |
|---|---|---|
| color-contrast | serious | Background color could not be determined on `#sales-actions-search-field` (overlapped by another element) |

---

## Key DOM Structure

```
<!DOCTYPE html>
<html>
<head>
  <title>Door 2 Door</title>
  <!-- Portal theme CSS, FontAwesome, mashroom SSR scripts -->
</head>
<body>
  <header>
    <div class="meta-wrapper">
      <div class="meta-navigation">
        <!-- Widget Versions debug link, logout link -->
      </div>
    </div>
    <div class="navi-wrapper">
      <div class="navigation"> ... </div>
    </div>
  </header>

  <main>
    <nav>
      <div class="menu-drawer"> ... </div>
      <ul class="nav flex-column">
        <li class="nav-item"><a class="nav-link" href="...">Home</a></li>
        <li class="nav-item"><a class="nav-link active">Door 2 Door</a></li>
        <li class="nav-item"><a class="nav-link" href="...">Timey</a></li>
        <li class="nav-item"><a class="nav-link" href="...">Cockpit-Leistungspositionen</a></li>
        <li class="nav-item"><a class="nav-link" href="...">Case Comments</a></li>
        <li class="nav-item"><a class="nav-link" href="...">Case Document Viewer</a></li>
        <li class="nav-item"><a class="nav-link" href="...">Address List</a></li>
      </ul>
    </nav>

    <div class="mashroom-portal-apps-container container-fluid">
      <div class="mashroom-portal-app-wrapper portal-app-door2door-microflow">
        <!-- Mashroom micro-frontend host -->
        <div id="default" class="zJUgS_bYfW1tH_dg_fDk">
          <div class="mashroom-portal-app-wrapper portal-app-door2door">
            <div id="door2door-root" class="Zv9eF5o_CJWdioRDJFCB">

              <!-- App top nav: Baulose | Objekte | Sales Action* | Benutzerverwaltung | Importe | Konfiguration -->
              <ul class="AwobfINgFCj1Omp2ck36">
                <li><a data-discover="true">Baulose</a></li>
                <li class="KYF3AfbkduUg4MQG5TVh"><a data-discover="true">Sales Action</a></li>
                ...
              </ul>

              <!-- Sales Actions page area -->
              <div class="pfEATVLDqurA643R1upa">
                <!-- Search bar -->
                <div class="gucci-common-search-field ...">
                  <input id="sales-actions-search-field" type="text" autocomplete="off">
                  <button class="search-button icon-a1-lupe" type="button"></button>
                </div>

                <!-- Filter bar -->
                <div class="rKlV2fnvJSFkCR7ROIl8">
                  <!-- "alle Filter" trigger -->
                  <div role="button" class="TwnxyiK4zioNv_1I44Bx">alle Filter</div>

                  <!-- Column sort/filter headers (div[role=button] pairs) -->
                  <div class="GyfjSF_5Zl90cmzsLA91">
                    <div class="UFvrUIjxpN2jf7hCLUNw">
                      <div role="button" class="HePyFz5n_qN7wvTgUrv1">Baulos/Einsatzname
                        <div role="button" class="gucci-icon-button-v2 secondary">▼</div>
                      </div>
                    </div>
                    <!-- ... Organisation, Regime, Phase, Termin, Immobilienart, Status, Aufgabe, Ergebnis, Planskizze, Bestellung über D2D ... -->
                  </div>

                  <!-- Table rows (50 rows, no stable locators) -->
                  <!-- Each row: div with CSS class only, contains row action icon buttons -->

                  <!-- Pagination controls -->
                </div>

                <!-- SIDE PANEL (open state) -->
                <!-- Panel contains door-level detail, form fields (26 unlabelled inputs), action buttons -->
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
```

**Architecture notes:**
- The app is served as a Mashroom micro-frontend (`portal-app-door2door`) embedded inside a microflow wrapper (`portal-app-door2door-microflow`).
- All CSS class names are obfuscated (hashed) — e.g. `Zv9eF5o_CJWdioRDJFCB`, `HePyFz5n_qN7wvTgUrv1`. None are stable locators.
- The app navigation uses `data-discover="true"` links with hash routing (`#/sales-actions/ftth/...`).
- The side panel is the open state for door-level detail of a Sales Action FTTH record.
- Dropdown options (5678 of them) are custom `div` elements — not native `<option>` elements — missing required ARIA parent roles.

---

## Page Notes

*(Full content of IMPROVEMENTS.md)*

# UI Improvements - sales-actions / ftth-detail-door-level / side-panel-open

- Capture type: configured route sweep
- Total interactive elements: 5932
- Open shadow roots detected: 0
- Iframes detected: 0
- Raw DOM remains local in `raw-dom.html` and is not included here.

## Accessibility Violations By Rule

- aria-command-name: serious; nodes: 93
- aria-required-parent: critical; nodes: 5680
- button-name: critical; nodes: 1
- color-contrast: serious; nodes: 102
- html-has-lang: serious; nodes: 1
- image-alt: critical; nodes: 1
- label: critical; nodes: 26
- link-name: serious; nodes: 1
- nested-interactive: serious; nodes: 42
- page-has-heading-one: moderate; nodes: 1
- region: moderate; nodes: 4

## Repeated Issues

### Elements with missing labels

- form field: Form control is missing a visible label or accessible name. Count: 26; priority: High

### Icon-only controls without meaningful accessible names

- row action button: Icon-only control has no meaningful accessible name. Count: 66; priority: High
- icon-only button: Icon-only control has no meaningful accessible name. Count: 27; priority: High

### Duplicate HTML id values

- None detected.

### CSS-class-only locator risks

- table row: Element currently risks requiring CSS-class-only locators. Count: 50; priority: Medium
- none element: Element currently risks requiring CSS-class-only locators. Count: 2; priority: Medium

### Long DOM-path locator risks

- link: Diagnostic DOM path is long and would be brittle as a locator. Count: 39; priority: Medium
- standard button: Diagnostic DOM path is long and would be brittle as a locator. Count: 5; priority: Medium
- search field: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium
- interactive element: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium

### Generic div elements that behave like buttons

- standard button: Generic div behaves like a button; prefer a native button. Count: 18; priority: High
- row action button: Generic div behaves like a button; prefer a native button. Count: 4; priority: High
- dropdown trigger: Generic div behaves like a button; prefer a native button. Count: 2; priority: High

### Custom dropdown-like components

- dropdown option: Custom dropdown-like component should expose stable roles, names, and expanded/selected state. Count: 5678; priority: Medium
- dropdown trigger: Custom dropdown-like component should expose stable roles, names, and expanded/selected state. Count: 2; priority: Medium

## Existing Useful Data-testid Values

- None detected.

## Missing Recommended Data-testid Values

- icon-only button (x19): Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- table row (x1): Element currently risks requiring CSS-class-only locators.

## Representative Recommendations

### link — Medium
Issue: Diagnostic DOM path is long and would be brittle as a locator.
Recommended Playwright locator: `page.getByRole('link', { name: /Baulose/i })`

### search field — Medium
Issue: Long DOM path; missing label.
Snippet: `<input id="sales-actions-search-field" type="text" ...>`
Recommended: `page.getByLabel("Suche in Sales Actions...")`

### icon-only button — High
Issue: Icon-only control has no meaningful accessible name.
Snippet: `<button class="search-button icon-a1-lupe" type="button"></button>`
Fix: Add `aria-label` + `data-testid="d2d-page-icon-only-button"`

### standard button — High
Issue: Generic div behaves like a button.
Snippet: `<div tabindex="0" role="button" class="TwnxyiK4zioNv_1I44Bx">...alle Filter...</div>`
Fix: Replace with `<button type="button">alle Filter</button>`

### Column headers (Baulos/Einsatzname, Organisation, Regime, Phase, Termin, Immobilienart, Status, Aufgabe, Ergebnis, Planskizze, Bestellung über D2D) — High
Issue: Generic div[role=button] with nested icon-only div[role=button].
Fix: Replace with native `<button>` elements.
