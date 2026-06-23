# DOM & Accessibility — FTTH Detail Side Panel (Objekte)

## Source

- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-detail-info/side-panel-open/accessibility-report.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-detail-info/side-panel-open/IMPROVEMENTS.md`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-detail-info/side-panel-open/interactive-elements.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/objects/ftth-detail-info/side-panel-open/sanitized-dom.html`

---

## Accessibility Tree

**Summary**

| Category | Count |
|---|---|
| Violations | 10 |
| Passes | 43 |
| Incomplete | 0 |
| Inapplicable | 42 |

### Violations

| Rule ID | Impact | Nodes | Description |
|---|---|---|---|
| `aria-command-name` | serious | 61 | Ensure every ARIA button, link and menuitem has an accessible name |
| `aria-required-parent` | critical | 4626 | Ensure elements with an ARIA role that require parent roles are contained by the |
| `button-name` | critical | 1 | Ensure buttons have discernible text |
| `color-contrast` | serious | 103 | Ensure the contrast between foreground and background colors meets WCAG 2 AA min |
| `html-has-lang` | serious | 1 | Ensure every HTML document has a lang attribute |
| `image-alt` | critical | 1 | Ensure <img> elements have alternative text or a role of none or presentation |
| `link-name` | serious | 1 | Ensure links have discernible text |
| `nested-interactive` | serious | 30 | Ensure interactive controls are not nested as they are not always announced by s |
| `page-has-heading-one` | moderate | 1 | Ensure that the page, or at least one of its frames contains a level-one heading |
| `region` | moderate | 4 | Ensure all page content is contained by landmarks |

### Incomplete Checks

_None_

---

## Key DOM Structure

_(Key structural snippets extracted from `sanitized-dom.html` — 583k chars total)_

### <body> opening
```html
<body>
  <div id="mashroom-portal-admin-app-container">
    <!-- Admin app goes here -->
  </div>

  <header>
    <div class="meta-wrapper">
      <div class="meta-navigation">
        <div class="spacer"></div>
        <div class="debug-info">
          <div class="environment">Environment: integration</div>
          <div class="versions">Portal Version: 1.28.30, <a href="[redacted-url]" onclick="toggleShowWidgetVersions()">Widget Versions</a></div>
        </div>
          <div class="user-wrapper">
            <div class="user-name" onclick="toggleUserMenu()">
              Krasimir Petkov
            </div>
          </div>
          <div class="user-menu">
            <div class="logout">
              <a href="https://www.a1.net/start/logout.sp">Abmelden</a>
            </div>
```

### <header>
```html
<header>
    <div class="meta-wrapper">
      <div class="meta-navigation">
        <div class="spacer"></div>
        <div class="debug-info">
          <div class="environment">Environment: integration</div>
          <div class="versions">Portal Version: 1.28.30, <a href="[redacted-url]" onclick="toggleShowWidgetVersions()">Widget Versions</a></div>
        </div>
          <div class="user-wrapper">
            <div class="user-name" onclick="toggleUserMenu()">
              Krasimir Petkov
            </div>
          </div>
          <div class="user-menu">
            <div class="logout
```

### <main> / navigation
```html
<main>
      <nav>
        <div class="menu-drawer" onclick="toggleMenu()" title="Navigation"></div>
        <div class="pages">
          <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="https://portal-int.open-frontends.a1.net/">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" href="">Door 2 Door</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://portal-int.open-frontends.a1.net/timey">Timey</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://portal-int.open-frontends.a1.net/leistungspositionen">Cockpit-Leistungspositionen</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://portal-int.open-frontends.a1.net/case_comments">Case Comments</a>
                </li>
```

### Modal overlay (#mashroom-portal-modal-overlay)
```html
hentication</a>
      </div>
  </div>

  <div id="mashroom-portal-modal-overlay">
    <div class="mashroom-portal-modal-overlay-wrapper">
      <div class="mashroom-portal-modal-overlay-header">
        <div id="mashroom-portal-modal-overlay-title">Title</div>
        <div id="mashroom-portal-modal-overlay-close" class="close-button"></div>
      </div>
      <div class="mashroom-portal-modal-overlay-content">
        <div id="mashroom-portal-modal-overlay-app">
          <!-- Modal apps go here -->
        </div>
      </div>
    </div>
  </div>

  <footer>
    <div class="copyright">
      <a href="https://www.a1.group/" target="_blank">A1 Telekom Austria Group</a>
    </div>
  </footer>

  
            <script>[REDACTED_SCRIPT_CONTENT]</script>
            
        

  <script>[REDACTED_SCRIPT_CONTENT]</script>

<div class="gucci-common-select-field-drop-down in-p
```

### Navigation drawer (.menu-drawer)
```html
header>

  <main>
      <nav>
        <div class="menu-drawer" onclick="toggleMenu()" title="Navigation"></div>
        <div class="pages">
          <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="https://portal-int.open-frontends.a1.net/">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" href="">Door 2 Door</a>
```

### data-testid anchor (microflow-wrapper)
```html
ntent="app" class="mashroom-portal-app-host"><div data-testid="microflow-wrapper"><div class="zJUgS_bYfW1tH_dg_fDk " id="default"><div data-mr-app-id="v95cEyMh" data-mr-app-name="Door2Door" class="mashroom-portal-app-wrapper portal-app-door2door">        <div class="mashroom-portal-app-header">            <div data-mr-app-content="title" class="mashroom-portal-app-header-title">Door2Door</div>        </div>        <div data-mr-app-content="app" class="mashroom-portal-app-host"><div class="Zv9eF5o_CJWdioRDJFCB" id="door2door-root"><div id="filter-dropdown-root"><div style="position: absolute; top: 0px; left: 0px; z-index: 1;"></div></div><div class="p3Kr
```

### Close button #1
```html
v id="mashroom-portal-modal-overlay-close" class="close-button"></div>
      </div>
      <div class="mashroom-portal-modal-overlay-content">
        <div id="mashroom-portal-modal-overlay-app">
          <!-- Modal apps go here -->
        </div>
      </div>
    </div>
  </div>

  <footer>
    <div class="copyright">
      <a href="https://www.a1.group/" tar
```


---

## Page Notes

# UI Improvements - objects / ftth-detail-info / side-panel-open

- Capture type: configured route sweep
- Total interactive elements: 4777
- Open shadow roots detected: 0
- Iframes detected: 0
- Raw DOM remains local in `raw-dom.html` and is not included here.

## Accessibility Violations By Rule

- aria-command-name: serious; nodes: 61
- aria-required-parent: critical; nodes: 4626
- button-name: critical; nodes: 1
- color-contrast: serious; nodes: 103
- html-has-lang: serious; nodes: 1
- image-alt: critical; nodes: 1
- link-name: serious; nodes: 1
- nested-interactive: serious; nodes: 30
- page-has-heading-one: moderate; nodes: 1
- region: moderate; nodes: 4

## Repeated Issues

### Elements with missing labels

- None detected.

### Icon-only controls without meaningful accessible names

- row action button: Icon-only control has no meaningful accessible name. Count: 50; priority: High
- icon-only button: Icon-only control has no meaningful accessible name. Count: 12; priority: High

### Duplicate HTML id values

- None detected.

### CSS-class-only locator risks

- table row: Element currently risks requiring CSS-class-only locators. Count: 25; priority: Medium
- none element: Element currently risks requiring CSS-class-only locators. Count: 2; priority: Medium

### Long DOM-path locator risks

- link: Diagnostic DOM path is long and would be brittle as a locator. Count: 37; priority: Medium
- standard button: Diagnostic DOM path is long and would be brittle as a locator. Count: 2; priority: Medium
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


