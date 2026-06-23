# DOM & Accessibility — FTTH List (Objekte)

## Source

- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-list/default/accessibility-report.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-list/default/IMPROVEMENTS.md`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-list/default/interactive-elements.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-list/default/sanitized-dom.html`

---

## Accessibility Tree

### Summary

| Metric     | Count |
|------------|-------|
| Violations | 9     |
| Passes     | 42    |
| Incomplete | 0     |

### Violations

| ID | Impact | Nodes | Description |
|----|--------|-------|-------------|
| `aria-command-name` | serious | 60 | Ensure every ARIA button, link and menuitem has an accessible name |
| `aria-required-parent` | critical | 4626 | Ensure elements with an ARIA role that require parent roles are contained by them |
| `button-name` | critical | 1 | Ensure buttons have discernible text |
| `color-contrast` | serious | 98 | Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio |
| `html-has-lang` | serious | 1 | Ensure every HTML document has a lang attribute |
| `image-alt` | critical | 1 | Ensure img elements have alternative text or a role of none/presentation |
| `nested-interactive` | serious | 30 | Ensure interactive controls are not nested as they are not always announced by screen readers |
| `page-has-heading-one` | moderate | 1 | Ensure that the page, or at least one of its frames contains a level-one heading |
| `region` | moderate | 4 | Ensure all page content is contained by landmarks |

**Critical violations (must fix):** `aria-required-parent` (4626 nodes — dropdown menuitems outside a menu container), `button-name` (1 unlabelled button), `image-alt` (1 image without alt text).

**Serious violations:** `aria-command-name` (60 icon-only controls with no accessible name), `color-contrast` (98 elements failing WCAG AA), `html-has-lang` (missing lang on html element), `nested-interactive` (30 cases of nested focusable elements).

---

## Key DOM Structure

### Landmark Hierarchy

```
<header>   — portal top bar (logo, user info, nav links, logout)
<nav>      — portal-level navigation (Home, Door 2 Door, Timey, ...)
<main>     — application content area
<footer>   — portal footer
```

No `<aside>`, `<section>`, or `<article>` elements are present.
The `region` violation (4 nodes) indicates content outside the landmark tree.

### Navigation Links (inside nav and app sidebar)

Portal-level links (no data-discover):
- `<a href="...">Widget Versions</a>` — dev utility
- `<a href="https://www.a1.net/start/logout.sp">Abmelden</a>` — logout
- `<a class="nav-link active" href="">Door 2 Door</a>` — active portal tab
- `<a class="nav-link" href="...">Timey</a>`, `Cockpit-Leistungspositionen`, `Case Comments`, `Case Document Viewer`, `Address List`

D2D in-app sidebar links (data-discover="true"):
- `Baulose` -> `#/baulose`
- `Objekte` -> `#/objekte`
- `Sales Action` -> `#/sales-actions`
- `Benutzerverwaltung` -> `#/benutzerverwaltung`
- `Importe` -> `#/importe`
- `Konfiguration` -> `#/konfiguration`

All D2D sidebar links use hash-based routing with a long absolute URL prefix — reason for the **long DOM-path locator risk** flagged in IMPROVEMENTS.md. Preferred locator: `page.getByRole('link', { name: /Objekte/i })`.

### Search Field

```html
<input id="objects-search-field" type="text" autocomplete="off" spellcheck="false" value="[REDACTED]">
```

The input has a stable `id` (`objects-search-field`) but lacks a `<label>` or `aria-label`, causing accessibility issues. The IMPROVEMENTS.md recommends:

```html
<label for="objects-search-field">Suche in Objekte...</label>
<input id="objects-search-field" type="search" />
```

Preferred Playwright locator: `page.getByLabel("Suche in Objekte...")`
Fallback locator: `page.locator('#objects-search-field')`

### Buttons

Only **1 native `<button>`** exists on the page:

```html
<button class="search-button icon-a1-lupe" type="button"></button>
```

This is the icon-only search trigger next to the search field. It has no accessible name — the `button-name` critical violation.
Recommended fix: add `aria-label="Suchen"` and `data-testid="d2d-search-button"`.

### Generic div[role="button"] Elements (9 total)

These `<div>` elements behave as buttons but are not native `<button>` elements:

| Visible Label | CSS Class (abbreviated) | Notes |
|---------------|------------------------|-------|
| alle Filter | `TwnxyiK4zioNv_1I44Bx` | Filter panel toggle — contains funnel icon SVG |
| nicht ubergeben | `qWiipqdmvgb4hpbhqJmH` | Status filter chip |
| zuruckgewiesen | `qWiipqdmvgb4hpbhqJmH` | Status filter chip |
| ubergeben | `qWiipqdmvgb4hpbhqJmH` | Status filter chip |
| (icon-only) | `HePyFz5n_qN7wvTgUrv1` | Row action button — repeated per row |
| (icon-only) | `gucci-icon-button-v2 secondary` | Row action button — repeated per row |

CSS class names are obfuscated/minified — **not stable as locators**. All need `aria-label` and ideally `data-testid`.

### ARIA Roles in Use

| Role | Count | Elements |
|------|-------|----------|
| `button` | 9+ | `div[role="button"]` — filter chips and row actions |
| `menuitem` | 4626 | `div[role="menuitem"]` inside dropdown lists — missing required parent `role="menu"` causing `aria-required-parent` critical violation |
| `none` | present | Decorative wrappers |

### Table / List Structure

No `<th>` elements detected. Table rows are rendered as custom `div` components with obfuscated class names, not as semantic `<table>/<tr>/<td>`. This is the source of:
- **CSS-class-only locator risk** (25 table rows)
- No stable locators on row elements without `data-testid`

### data-testid Coverage

Only **1** `data-testid` attribute exists in the entire page:

```html
data-testid="microflow-wrapper"
```

This wraps the Microflow embedded widget. No data-testids exist on any FTTH-list-specific elements.

### Portal / Mashroom Framework Wrappers

The page is hosted inside the **Mashroom Portal** framework. Key wrapper div attributes:

```html
<div data-mr-app-id="f4ofwZbY" data-mr-app-name="Door2Door Microflow" class="mashroom-portal-app-wrapper portal-app-door2door-microflow">
<div data-mr-app-id="v95cEyMh" data-mr-app-name="Door2Door" class="mashroom-portal-app-wrapper portal-app-door2door">
```

These `data-mr-app-*` attributes are stable and can be used to scope locators to the D2D app region, avoiding ambiguity with portal chrome.

---

## Page Notes

> Full content of IMPROVEMENTS.md follows.

# UI Improvements - objects / ftth-list / default

- Capture type: configured route sweep
- Total interactive elements: 4770
- Open shadow roots detected: 0
- Iframes detected: 0
- Raw DOM remains local in `raw-dom.html` and is not included here.

## Accessibility Violations By Rule

- aria-command-name: serious; nodes: 60
- aria-required-parent: critical; nodes: 4626
- button-name: critical; nodes: 1
- color-contrast: serious; nodes: 98
- html-has-lang: serious; nodes: 1
- image-alt: critical; nodes: 1
- nested-interactive: serious; nodes: 30
- page-has-heading-one: moderate; nodes: 1
- region: moderate; nodes: 4

## Repeated Issues

### Elements with missing labels

- None detected.

### Icon-only controls without meaningful accessible names

- row action button: Icon-only control has no meaningful accessible name. Count: 50; priority: High
- icon-only button: Icon-only control has no meaningful accessible name. Count: 11; priority: High

### Duplicate HTML id values

- None detected.

### CSS-class-only locator risks

- table row: Element currently risks requiring CSS-class-only locators. Count: 25; priority: Medium
- none element: Element currently risks requiring CSS-class-only locators. Count: 1; priority: Medium

### Long DOM-path locator risks

- link: Diagnostic DOM path is long and would be brittle as a locator. Count: 34; priority: Medium
- search field: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium

### Generic div elements that behave like buttons

- standard button: Generic div behaves like a button; prefer a native button. Count: 9; priority: High
- dropdown trigger: Generic div behaves like a button; prefer a native button. Count: 2; priority: High

### Custom dropdown-like components

- dropdown option: Custom dropdown-like component should expose stable roles, names, and expanded/selected state. Count: 4624; priority: Medium
- dropdown trigger: Custom dropdown-like component should expose stable roles, names, and expanded/selected state. Count: 2; priority: Medium

## Existing Useful Data-testid Values

- None detected.

## Missing Recommended Data-testid Values

- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- table row: Element currently risks requiring CSS-class-only locators. Recommended locator: `page.getByRole('none', { name: /Meaningful control name/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`

## Representative Recommendations

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Baulose</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Baulose/i })`

### search field - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<input id="objects-search-field" type="text" autocomplete="off" spellcheck="false" value="[REDACTED]">
```

Recommended Playwright locator: `page.getByLabel("Suche in Objekte...")`

### icon-only button - High

Issue: Icon-only control has no meaningful accessible name.

Current sanitized snippet:

```html
<button class="search-button icon-a1-lupe" type="button"></button>
```

Recommended improved snippet:

```html
<button type="button" aria-label="Describe action" data-testid="d2d-page-icon-only-button">
  <span class="icon" aria-hidden="true"></span>
</button>
```

Recommended Playwright locator: `page.getByRole('button', { name: /Describe action/i })`

### standard button - High

Issue: Generic div behaves like a button; prefer a native button.

Current sanitized snippet:

```html
<div tabindex="0" role="button" class="TwnxyiK4zioNv_1I44Bx">...</div>
```

Recommended improved snippet:

```html
<button type="button">alle Filter</button>
```

Recommended Playwright locator: `page.getByRole('button', { name: /alle Filter/i })`

### standard button - High

Issue: Generic div behaves like a button; prefer a native button.

Current sanitized snippet:

```html
<div class="qWiipqdmvgb4hpbhqJmH" role="button" tabindex="0">nicht ubergeben</div>
```

Recommended Playwright locator: `page.getByRole('button', { name: /nicht ubergeben/i })`
