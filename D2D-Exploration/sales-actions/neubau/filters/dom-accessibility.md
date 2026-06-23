# DOM & Accessibility — Sales Actions: Neubau List (Filters)

## Source
- `sales-actions/neubau-list/default (filters state)/accessibility-report.json`
- `sales-actions/neubau-list/default (filters state)/sanitized-dom.html`
- `sales-actions/neubau-list/default (filters state)/IMPROVEMENTS.md`

## Accessibility Tree

### Violations

- **aria-command-name** — serious, 78 node(s): Ensure every ARIA button, link and menuitem has an accessible name
- **aria-required-parent** — critical, 198 node(s): Ensure elements with an ARIA role that require parent roles are contained by them
- **button-name** — critical, 1 node(s): Ensure buttons have discernible text
- **color-contrast** — serious, 111 node(s): Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **html-has-lang** — serious, 1 node(s): Ensure every HTML document has a lang attribute
- **image-alt** — critical, 1 node(s): Ensure <img> elements have alternative text or a role of none or presentation
- **label** — critical, 26 node(s): Ensure every form element has a label
- **link-name** — serious, 1 node(s): Ensure links have discernible text
- **nested-interactive** — serious, 42 node(s): Ensure interactive controls are not nested as they are not always announced by screen readers or can cause focus problems for assistive technologies
- **page-has-heading-one** — moderate, 1 node(s): Ensure that the page, or at least one of its frames contains a level-one heading
- **region** — moderate, 4 node(s): Ensure all page content is contained by landmarks

### Passes

aria-allowed-attr, aria-allowed-role, aria-command-name, aria-conditional-attr, aria-deprecated-role, aria-hidden-body, aria-prohibited-attr, aria-required-attr, aria-roles, aria-valid-attr-value, aria-valid-attr, autocomplete-valid, avoid-inline-spacing, bypass, color-contrast, document-title, duplicate-id-aria, form-field-multiple-labels, image-redundant-alt, label-title-only, label, landmark-banner-is-top-level, landmark-contentinfo-is-top-level, landmark-main-is-top-level, landmark-no-duplicate-banner, landmark-no-duplicate-contentinfo, landmark-no-duplicate-main, landmark-one-main, landmark-unique, link-in-text-block, link-name, list, listitem, meta-viewport-large, meta-viewport, nested-interactive, region, scrollable-region-focusable, tabindex, table-duplicate-name, td-headers-attr, th-has-data-cells

### Incomplete

color-contrast

## Key DOM Structure

```html
<!DOCTYPE html>
<html><head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <meta name="description" content="">
  <meta name="keywords" content="">

  <title>Door 2 Door</title>

  <link rel="icon" type="image/png" sizes="32x32" href="https://portal-int.open-frontends.a1.net/___/theme/A1.net%20Portal%20Theme/assets/favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="96x96" href="https://portal-int.open-frontends.a1.net/___/theme/A1.net%20Portal%20Theme/assets/favicon/favicon-96x96.png">
  <link rel="icon" type="image/png" sizes="16x16" href="https://portal-int.open-frontends.a1.net/___/theme/A1.net%20Portal%20Theme/assets/favicon/favicon-16x16.png">

  <link rel="stylesheet" type="text/css" href="https://portal-int.open-frontends.a1.net/___/theme/A1.net%20Portal%20Theme/portal.css?[redacted-query]">

  <link rel="stylesheet" type="text/css" href="https://portal-int.open-frontends.a1.net/___/theme/A1.net%20Portal%20Theme/fontawesome/css/regular.css?[redacted-query]">
  <link rel="stylesheet" type="text/css" href="https://portal-int.open-frontends.a1.net/___/theme/A1.net%20Portal%20Theme/fontawesome/css/solid.css?[redacted-query]">

  
            <script>[REDACTED_SCRIPT_CONTENT]</script>
            
                <script>[REDACTED_SCRIPT_CONTENT]</script>
            
            <script src="https://portal-int.open-frontends.a1.net/___/client.js?[redacted-query]">[REDACTED_SCRIPT_CONTENT]</script>
            
            <script data-mashroom-ssr-head-script="1">[REDACTED_SCRIPT_CONTENT]</script>
        


  <script type="application/javascript">[REDACTED_SCRIPT_CONTENT]</script>
<script src="https://portal-int.open-frontends.a1.net/___/apps/Door2Door%20Microflow/index.js?[redacted-query]">[REDACTED_SCRIPT_CONTENT]</script><style>.cjhBEuyLQXwMyzrOsFf_{display:none}.Og1jzoKnBjef8FwfzVxC{padding:10px;font-size:1.4em;color:var(--gucci-color-secondary)}.srM_x5R5jnYUIfy3gTBM{padding:0 10px}.zJUgS_bYfW1tH_dg_fDk{position:relative}</style><style>.ZWd77xzPLNZQXGYIpbn9{background-color:var(--gucci-color-border-light-grey);display:flex}.PmY2p2AfaSoOxCgGNXky{display:flex;align-items:center;gap:var(--gucci-padding-small);background-color:var(--gucci-color-border-light-grey);cursor:pointer;padding:var(--gucci-padding-small) var(--gucci-padding-normal);border-top:1px solid var(--gucci-color-border);border-right:1px solid
... [truncated]
```

## Page Notes

# UI Improvements - sales-actions / neubau-list / default

- Capture type: configured route sweep
- Total interactive elements: 424
- Open shadow roots detected: 0
- Iframes detected: 0
- Raw DOM remains local in `raw-dom.html` and is not included here.

## Accessibility Violations By Rule

- aria-command-name: serious; nodes: 78
- aria-required-parent: critical; nodes: 198
- button-name: critical; nodes: 1
- color-contrast: serious; nodes: 111
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

- row action button: Icon-only control has no meaningful accessible name. Count: 56; priority: High
- icon-only button: Icon-only control has no meaningful accessible name. Count: 23; priority: High

### Duplicate HTML id values

- None detected.

### CSS-class-only locator risks

- table row: Element currently risks requiring CSS-class-only locators. Count: 25; priority: Medium
- link: Element currently risks requiring CSS-class-only locators. Count: 1; priority: Medium
- none element: Element currently risks requiring CSS-class-only locators. Count: 1; priority: Medium

### Long DOM-path locator risks

- link: Diagnostic DOM path is long and would be brittle as a locator. Count: 33; priority: Medium
- table row: Diagnostic DOM path is long and would be brittle as a locator. Count: 25; priority: Medium
- search field: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium

### Generic div elements that behave like buttons

- standard button: Generic div behaves like a button; prefer a native button. Count: 18; priority: High
- row action button: Generic div behaves like a button; prefer a native button. Count: 4; priority: High
- dropdown trigger: Generic div behaves like a button; prefer a native button. Count: 2; priority: High

### Custom dropdown-like components

- dropdown option: Custom dropdown-like component should expose stable roles, names, and expanded/selected state. Count: 196; priority: Medium
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
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- link: Element currently risks requiring CSS-class-only locators. Recommended locator: `page.getByRole('link', { name: /Meaningful control name/i })`

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
<input id="sales-actions-search-field" type="text" autocomplete="off" spellcheck="false" value="[REDACTED]">
```

Recommended improved snippet:

```html
<label for="sales-actions-search-field">Suche in Sales Actions...</label>
<input id="sales-actions-search-field" type="search" />
```

Recommended Playwright locator: `page.getByLabel("Suche in Sales Actions...")`
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
<div tabindex="0" role="button" class="HePyFz5n_qN7wvTgUrv1">Baulos/Einsatzname<div class="gucci-icon-button-v2 secondary" role="button" tabindex="0"><div class="gucci-icon-v2"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4.268 6L0 10.267l16 16 16-16L27.734 6 16.001 17.733 4.268 6z"></path></svg></div></div></div>
```

Recommended improved snippet:

```html
<button type="button">Baulos/Einsatzname</button>
```

Recommended Playwright locator: `page.getByRole('button', { name: /Baulos/Einsatzname/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### icon-only button - High

Issue: Icon-only control has no meaningful accessible name.

Current sanitized snippet:

```html
<div class="gucci-icon-button-v2 secondary" role="button" tabindex="0"><div class="gucci-icon-v2"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4.268 6L0 10.267l16 16 16-16L27.734 6 16.001 17.733 4.268 6z"></path></svg></div></div>
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
<div tabindex="0" role="button" class="HePyFz5n_qN7wvTgUrv1">Organisation<div class="gucci-icon-button-v2 secondary" role="button" tabindex="0"><div class="gucci-icon-v2"><svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4.268 6L0 10.267l16 16 16-16L27.734 6 16.001 17.733 4.268 6z"></path></svg></div></div></div>
```

Recommended improved snippet:

```html
<button type="button">Organisation</button>
```

Recommended Playwright locator: `page.getByRole('button', { name: /Organisation/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No


