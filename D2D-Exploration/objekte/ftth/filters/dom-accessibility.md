# DOM & Accessibility — FTTH List Filters (Objekte)

## Source

The following source files were captured from the FTTH list page (default state), representing the **filters view** of that same page:

- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-list/default/accessibility-report.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-list/default/IMPROVEMENTS.md`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-list/default/interactive-elements.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-list/default/sanitized-dom.html`

> **Note:** All four files originate from `ftth-list/default`. The filters UI (search field, "alle Filter" button, quick-filter chips, and filter-dropdown-root portal) is part of the same page — no separate route was captured.

---

## Accessibility Tree

### Violations

| Rule ID | Impact | Nodes | Description |
|---------|--------|-------|-------------|
| `aria-command-name` | serious | 60 | Elements with aria roles that are commands (link, menuitem, etc.) have no accessible name |
| `aria-required-parent` | critical | 4626 | Elements with aria roles must be contained in or owned by specific parent elements |
| `button-name` | critical | 1 | Buttons must have discernible text |
| `color-contrast` | serious | 98 | Elements must have sufficient color contrast |
| `html-has-lang` | serious | 1 | html element must have a lang attribute |
| `image-alt` | critical | 1 | Images must have alternate text |
| `nested-interactive` | serious | 30 | Interactive controls must not be nested within each other |
| `page-has-heading-one` | moderate | 1 | Page should contain a level-one heading |
| `region` | moderate | 4 | All page content should be contained by landmarks |

**Summary:** 9 violations / 42 passes / 0 incomplete

### Violations Relevant to Filters

The filter area is directly affected by several violations:

- **`aria-command-name` (serious, 60 nodes):** The quick-filter chip buttons (`nicht übergeben`, `zurückgewiesen`, `übergeben`) and the `alle Filter` button use `role="button"` on `<div>` elements. If their inner text is not properly exposed as an accessible name they will be flagged here.
- **`button-name` (critical, 1 node):** The search button (`.search-button.icon-a1-lupe`) is an icon-only `<button>` with no visible text and no `aria-label`, making it completely unnamed to screen readers.
- **`nested-interactive` (serious, 30 nodes):** The filter chips and the search field wrapper may nest interactive children inside elements that already have `role="button"` or `tabindex="0"`.
- **`region` (moderate, 4 nodes):** The filter bar and chip row are not wrapped in a landmark region, reducing discoverability for screen-reader users.
- **`color-contrast` (serious, 98 nodes):** Filter chip labels and placeholder text may not meet 4.5:1 contrast against their backgrounds.

---

## Key DOM Structure

### 1. Filter Portal Root

The dropdown overlay is rendered into a dedicated portal node at the top of the DOM, outside normal document flow:

```html
<div id="filter-dropdown-root">
  <div style="position: absolute; top: 0px; left: 0px; z-index: 1;"></div>
</div>
```

> `id="filter-dropdown-root"` is a stable, unique anchor. The inner positioned `<div>` is empty in the default (no open dropdown) state.

---

### 2. Search Field + Search Button

```html
<label for="objects-search-field">
  <span>Suche in Objekte...</span>
</label>
<input
  id="objects-search-field"
  type="text"
  autocomplete="off"
  spellcheck="false"
  value="[REDACTED]"
/>
<button class="search-button icon-a1-lupe" type="button"></button>
```

> The `<input>` has a stable `id="objects-search-field"` and an associated `<label>`. The `<button>` is icon-only with **no accessible name** — this is the `button-name` critical violation.

---

### 3. "alle Filter" Button

```html
<div tabindex="0" role="button" class="TwnxyiK4zioNv_1I44Bx">
  <div class="wiBCvM_pmvLu6ae8qFRX">
    <div class="gucci-icon-v2">
      <svg viewBox="0 0 32 32" ...></svg>
    </div>
  </div>
  <div>alle Filter </div>
</div>
```

> A `<div role="button">` with visible text "alle Filter". Has **no `data-testid`**, **no `aria-label`**, and **no `id`** — only CSS class locators are available. The trailing space in "alle Filter " may cause exact-match test failures.

---

### 4. Quick-Filter Chip Buttons

```html
<div class="qWiipqdmvgb4hpbhqJmH " role="button" tabindex="0">nicht übergeben</div>
<div class="qWiipqdmvgb4hpbhqJmH " role="button" tabindex="0">zurückgewiesen</div>
<div class="qWiipqdmvgb4hpbhqJmH " role="button" tabindex="0">übergeben</div>
```

> All three chips share the **same CSS class** and use `<div role="button">`. They have **no `data-testid`**, **no `aria-label`**, and **no `id`**. The only differentiator is visible text — fragile for automation.

---

## Page Notes

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
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- table row: Element currently risks requiring CSS-class-only locators. Recommended locator: `page.getByRole('none', { name: /Meaningful control name/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- table row: Element currently risks requiring CSS-class-only locators. Recommended locator: `page.getByRole('none', { name: /Meaningful control name/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- table row: Element currently risks requiring CSS-class-only locators. Recommended locator: `page.getByRole('none', { name: /Meaningful control name/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- table row: Element currently risks requiring CSS-class-only locators. Recommended locator: `page.getByRole('none', { name: /Meaningful control name/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- table row: Element currently risks requiring CSS-class-only locators. Recommended locator: `page.getByRole('none', { name: /Meaningful control name/i })`

## Representative Recommendations

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Baulose</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Baulose</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Baulose/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Objekte</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Objekte</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Objekte/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Sales Action</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Sales Action</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Sales Action/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Benutzerverwaltung</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Benutzerverwaltung</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Benutzerverwaltung/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Importe</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Importe</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Importe/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Konfiguration</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Konfiguration</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Konfiguration/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### search field - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<input id="objects-search-field" type="text" autocomplete="off" spellcheck="false" value="[REDACTED]">
```

Recommended improved snippet:

```html
<label for="objects-search-field">Suche in Objekte...</label>
<input id="objects-search-field" type="search" />
```

Recommended Playwright locator: `page.getByLabel("Suche in Objekte...")`
Preferred locator type: getByLabel()
Unique id required: No
aria-label required: No
data-testid recommended: No

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
Preferred locator type: getByRole()
Unique id required: No
aria-label required: Yes
data-testid recommended: Yes

### standard button - High

Issue: Generic div behaves like a button; prefer a native button.

Current sanitized snippet:

```html
<div tabindex="0" role="button" class="TwnxyiK4zioNv_1I44Bx"><div class="wiBCvM_pmvLu6ae8qFRX"><div class="gucci-icon-v2"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4 5.606V0h24v5.606l-7.043 7.812h-9.869L4 5.606zm16.867 9.622v6.135L11.133 32V15.228h9.734z"></path></svg></div></div><div>alle Filter</div></div>
```

Recommended improved snippet:

```html
<button type="button">alle Filter</button>
```

Recommended Playwright locator: `page.getByRole('button', { name: /alle Filter/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### standard button - High

Issue: Generic div behaves like a button; prefer a native button.

Current sanitized snippet:

```html
<div class="qWiipqdmvgb4hpbhqJmH" role="button" tabindex="0">nicht übergeben</div>
```

Recommended improved snippet:

```html
<button type="button">nicht übergeben</button>
```

Recommended Playwright locator: `page.getByRole('button', { name: /nicht übergeben/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### standard button - High

Issue: Generic div behaves like a button; prefer a native button.

Current sanitized snippet:

```html
<div class="qWiipqdmvgb4hpbhqJmH" role="button" tabindex="0">zurückgewiesen</div>
```

Recommended improved snippet:

```html
<button type="button">zurückgewiesen</button>
```

Recommended Playwright locator: `page.getByRole('button', { name: /zurückgewiesen/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### standard button - High

Issue: Generic div behaves like a button; prefer a native button.

Current sanitized snippet:

```html
<div class="qWiipqdmvgb4hpbhqJmH" role="button" tabindex="0">übergeben</div>
```

Recommended improved snippet:

```html
<button type="button">übergeben</button>
```

Recommended Playwright locator: `page.getByRole('button', { name: /übergeben/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No


