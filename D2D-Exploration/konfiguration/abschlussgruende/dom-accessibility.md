# DOM & Accessibility — Konfiguration / Abschlussgründe

## Source
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/configuration/outcomes/default/accessibility-report.json`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/configuration/outcomes/default/sanitized-dom.html`
- `/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/configuration/outcomes/default/IMPROVEMENTS.md`

## Accessibility Tree

**Summary:** 8 violations, 44 passes, 1 incomplete

### Violations

| Rule | Impact | Description | Nodes |
|------|--------|-------------|-------|
| `aria-command-name` | serious | Ensure every ARIA button, link and menuitem has an accessible name | 356 |
| `button-name` | critical | Ensure buttons have discernible text | 1 |
| `color-contrast` | serious | Ensure the contrast between foreground and background colors meets WCAG 2 AA min | 4 |
| `html-has-lang` | serious | Ensure every HTML document has a lang attribute | 1 |
| `image-alt` | critical | Ensure <img> elements have alternative text or a role of none or presentation | 1 |
| `nested-interactive` | serious | Ensure interactive controls are not nested as they are not always announced by s | 179 |
| `page-has-heading-one` | moderate | Ensure that the page, or at least one of its frames contains a level-one heading | 1 |
| `region` | moderate | Ensure all page content is contained by landmarks | 2 |

### Incomplete (needs manual review)

| Rule | Impact | Description | Nodes |
|------|--------|-------------|-------|
| `color-contrast` | serious | Ensure the contrast between foreground and background colors meets WCAG 2 AA min | 1 |

### Key Findings
- **Critical (×2):** Logo `<img>` missing alt text; 1 button with no discernible text label (`button-name`).
- **Serious — high volume:** 356 ARIA buttons/links/menuitems with no accessible name (`aria-command-name`) — icon-only row action buttons in the data table. 179 nested-interactive violations from table rows containing clickable children.
- **Serious — page level:** `<html>` missing `lang`; 4 color-contrast failures (up from 2 on Übersicht).
- **Moderate:** No `<h1>` heading; 2 content regions outside landmark elements.
- **Passes:** 44 rules passed (up from 29 on Übersicht — more elements tested across the full table).

## Key DOM Structure

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
          </div>
      </div>
    </div>
    <div class="navi-wrapper">
      <div class="navigation">
        <div class="logo-wrapper">
          <div class="logo">
            <img class="logo" src="https://portal-int.open-frontends.a1.net/___/theme/A1.net%20Portal%20Theme/assets/images/a1_logo.jpg">
          </div>
        </div>
      </div>
    </div>
  </header>

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
                <li class="nav-item">
                    <a class="nav-link" href="https://portal-int.open-frontends.a1.net/CaseDocumentViewer">Case Document Viewer</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="https://portal-int.open-frontends.a1.net/address_list">Address List</a>
                </li>
          </ul>  </div>
      </nav>
    <div class="mashroom-portal-apps-container container-fluid">
      <div class="row">
    <div class="mashroom-portal-app-area col-lg-12" id="app-area1">
    

        <!-- Portal Apps go here -->
    <div data-mr-app-id="f4ofwZbY" data-mr-app-name="Door2Door Microflow" class="mashroom-portal-app-wrapper portal-app-door2door-microflow">
        <div class="mashroom-portal-app-header">
            <div data-mr-app-c
```

## Page Notes

# UI Improvements - configuration / outcomes / default

- Capture type: configured route sweep
- Total interactive elements: 564
- Open shadow roots detected: 0
- Iframes detected: 0
- Raw DOM remains local in `raw-dom.html` and is not included here.

## Accessibility Violations By Rule

- aria-command-name: serious; nodes: 356
- button-name: critical; nodes: 1
- color-contrast: serious; nodes: 4
- html-has-lang: serious; nodes: 1
- image-alt: critical; nodes: 1
- nested-interactive: serious; nodes: 179
- page-has-heading-one: moderate; nodes: 1
- region: moderate; nodes: 2

## Repeated Issues

### Elements with missing labels

- None detected.

### Icon-only controls without meaningful accessible names

- row action button: Icon-only control has no meaningful accessible name. Count: 354; priority: High
- icon-only button: Icon-only control has no meaningful accessible name. Count: 3; priority: High

### Duplicate HTML id values

- None detected.

### CSS-class-only locator risks

- none element: Element currently risks requiring CSS-class-only locators. Count: 1; priority: Medium

### Long DOM-path locator risks

- table row: Diagnostic DOM path is long and would be brittle as a locator. Count: 177; priority: Medium
- link: Diagnostic DOM path is long and would be brittle as a locator. Count: 12; priority: Medium
- standard button: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium
- search field: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium

### Generic div elements that behave like buttons

- standard button: Generic div behaves like a button; prefer a native button. Count: 4; priority: High

### Custom dropdown-like components

- None detected.


## Existing Useful Data-testid Values

- None detected.

## Missing Recommended Data-testid Values

- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`
- row action button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Open row details/i })`

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

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a class="DQGQ7gJDRoOOez2DJb5h" href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Übersicht</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Übersicht</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Übersicht/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a class="DQGQ7gJDRoOOez2DJb5h BhpsZo8F_CFUzHHqYWW2" href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true" aria-current="page">Abschlussgründe</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Abschlussgründe</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Abschlussgründe/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a class="DQGQ7gJDRoOOez2DJb5h" href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Aufgaben</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Aufgaben</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Aufgaben/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a class="DQGQ7gJDRoOOez2DJb5h" href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Gruppen</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Gruppen</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Gruppen/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a class="DQGQ7gJDRoOOez2DJb5h" href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Regime</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Regime</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Regime/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No

### link - Medium

Issue: Diagnostic DOM path is long and would be brittle as a locator.

Current sanitized snippet:

```html
<a class="DQGQ7gJDRoOOez2DJb5h" href="https://portal-int.open-frontends.a1.net/door2door#[redacted-hash]" data-discover="true">Aktivitäten Setup</a>
```

Recommended improved snippet:

```html
<a href="/stable-route">Aktivitäten Setup</a>
```

Recommended Playwright locator: `page.getByRole('link', { name: /Aktivitäten Setup/i })`
Preferred locator type: getByRole()
Unique id required: No
aria-label required: No
data-testid recommended: No


