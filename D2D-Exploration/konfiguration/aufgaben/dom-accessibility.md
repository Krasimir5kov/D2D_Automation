# DOM & Accessibility — Aufgaben (Tasks)

## Source

- `Inspect d2d DOM/ui-audit/pages/configuration/tasks/default/accessibility-report.json`
- `Inspect d2d DOM/ui-audit/pages/configuration/tasks/default/sanitized-dom.html`
- `Inspect d2d DOM/ui-audit/pages/configuration/tasks/default/IMPROVEMENTS.md`

## Accessibility Tree

**Tested with:** axe-core 4.11.4  
**URL:** https://portal-int.open-frontends.a1.net/door2door#/konfiguration/aufgaben  
**Timestamp:** 2026-06-03T18:15:02.518Z  

**Summary counts:**
- Violations: 6 rules (9 total nodes affected)
- Passes: ~147 rules (no violations)
- Incomplete: 0
- Inapplicable: many

### Violations

| Rule ID | Impact | Nodes | Description |
|---|---|---|---|
| `button-name` | critical | 1 | Buttons must have discernible text |
| `color-contrast` | serious | 3 | Elements must meet minimum color contrast ratio thresholds |
| `html-has-lang` | serious | 1 | `<html>` element must have a lang attribute |
| `image-alt` | critical | 1 | Images must have alternative text |
| `page-has-heading-one` | moderate | 1 | Page should contain a level-one heading |
| `region` | moderate | 2 | All page content should be contained by landmarks |

### Violation Details

**button-name (critical)**
Element: `<button class="search-button icon-a1-lupe" type="button"></button>`
Issue: Icon-only search button has no accessible name — no inner text, no aria-label, no aria-labelledby, no title.

**color-contrast (serious) — 3 nodes:**
1. `.user-name` — user name text in header: contrast 4.31 (#da291c on #000000), expected 4.5:1, 14px bold
2. `.z894y8bTqIgr3d0w7fe_` — "Konfiguration" breadcrumb span: contrast 3.94 (#808080 on #ffffff), expected 4.5:1, 12px
3. `label > span` — "Suche in Aufgaben..." placeholder label: contrast 1.91 (#bbbbbb on #ffffff), expected 4.5:1, 15.75px

**html-has-lang (serious)**
Element: `<html>` — no lang attribute present.

**image-alt (critical)**
Element: `<img class="logo" src="...a1_logo.jpg">`
Issue: A1 logo image has no alt attribute.

**page-has-heading-one (moderate)**
No `<h1>` heading exists anywhere on the page.

**region (moderate) — 2 nodes:**
1. `#mashroom-portal-auth-expires-warning` — auth expiry warning div is outside any landmark
2. `#mashroom-portal-modal-overlay` — modal overlay div is outside any landmark

## Key DOM Structure

```html
<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <title>Door 2 Door</title>
  <!-- stylesheets, scripts redacted -->
</head>
<body>
  <div id="mashroom-portal-admin-app-container">
    <!-- Admin app goes here -->
  </div>

  <header>
    <div class="meta-wrapper">
      <div class="meta-navigation">
        <div class="debug-info">
          <div class="environment">Environment: integration</div>
          <div class="versions">Portal Version: 1.28.30,
            <a href="[redacted-url]">Widget Versions</a>
          </div>
        </div>
        <div class="user-wrapper">
          <div class="user-name" onclick="toggleUserMenu()">Krasimir Petkov</div>
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
          <!-- NOTE: missing alt attribute — accessibility violation -->
          <img class="logo" src="...a1_logo.jpg">
        </div>
      </div>
    </div>
  </header>

  <main>
    <nav>
      <div class="menu-drawer" onclick="toggleMenu()" title="Navigation"></div>
      <div class="pages">
        <ul class="nav flex-column">
          <li class="nav-item"><a class="nav-link" href="...">Home</a></li>
          <li class="nav-item"><a class="nav-link active" href="">Door 2 Door</a></li>
          <li class="nav-item"><a class="nav-link" href="...">Timey</a></li>
          <li class="nav-item"><a class="nav-link" href="...">Cockpit-Leistungspositionen</a></li>
          <li class="nav-item"><a class="nav-link" href="...">Case Comments</a></li>
          <li class="nav-item"><a class="nav-link" href="...">Case Document Viewer</a></li>
          <li class="nav-item"><a class="nav-link" href="...">Address List</a></li>
        </ul>
      </div>
    </nav>

    <!-- Mashroom portal app container -->
    <div class="mashroom-portal-apps-container container-fluid">
      <div class="row">
        <div id="app-area1" class="mashroom-portal-app-area col-lg-12">
          <div class="mashroom-portal-app-wrapper portal-app-door2door-microflow">
            <div class="mashroom-portal-app-host">
              <div id="default">
                <div class="mashroom-portal-app-wrapper portal-app-door2door">
                  <div class="mashroom-portal-app-host">
                    <div id="door2door-root">

                      <!-- Top-level D2D navigation -->
                      <ul class="AwobfINgFCj1Omp2ck36">
                        <li><a data-discover="true" href="...">Baulose</a></li>
                        <li><a data-discover="true" href="...">Objekte</a></li>
                        <li><a data-discover="true" href="...">Sales Action</a></li>
                        <li><a data-discover="true" href="...">Benutzerverwaltung</a></li>
                        <li><a data-discover="true" href="...">Importe</a></li>
                        <li class="KYF3AfbkduUg4MQG5TVh">
                          <a data-discover="true" href="...">Konfiguration</a>
                        </li>
                      </ul>

                      <!-- Konfiguration sub-nav tabs -->
                      <div class="EHlDZlTv7vV3eznMQ6ju">
                        <a class="DQGQ7gJDRoOOez2DJb5h" data-discover="true">Übersicht</a>
                        <a class="DQGQ7gJDRoOOez2DJb5h" data-discover="true">Abschlussgründe</a>
                        <!-- ACTIVE page -->
                        <a class="DQGQ7gJDRoOOez2DJb5h BhpsZo8F_CFUzHHqYWW2"
                           data-discover="true" aria-current="page">Aufgaben</a>
                        <a class="DQGQ7gJDRoOOez2DJb5h" data-discover="true">Gruppen</a>
                        <a class="DQGQ7gJDRoOOez2DJb5h" data-discover="true">Regime</a>
                        <a class="DQGQ7gJDRoOOez2DJb5h" data-discover="true">Aktivitäten Setup</a>
                      </div>

                      <!-- Page content area -->
                      <div class="UDYvdG45wMOJbQlRI5hA">
                        <div class="bF5e0uPjQ54kVj6ctv4f">
                          <!-- "Aufgabe erstellen" primary action button -->
                          <div class="gucci-common-button">
                            <button type="button" class="normal link">
                              <!-- SVG plus icon + label -->
                              <span>Aufgabe erstellen</span>
                            </button>
                          </div>
                          <!-- Search field -->
                          <div class="KJBVZSjaKNbDypKdMbyH">
                            <div class="gucci-common-search-field gucci-common-floating-label show-border">
                              <input id="sales-action-tasks-search-field" type="text"
                                     autocomplete="off" spellcheck="false">
                              <!-- NOTE: icon-only, no accessible name — critical violation -->
                              <button class="search-button icon-a1-lupe" type="button"></button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer>
    <div class="copyright">
      <a href="https://www.a1.group/" target="_blank">A1 Telekom Austria Group</a>
    </div>
  </footer>

  <!-- Outside landmarks — accessibility violation -->
  <div id="mashroom-portal-auth-expires-warning">
    <a id="mashroom-portal-auth-expires-extend" href="[redacted-url]">Extend authentication</a>
  </div>
  <div id="mashroom-portal-modal-overlay"></div>
</body>
```

## Page Notes

# UI Improvements - configuration / tasks / default

- Capture type: configured route sweep
- Total interactive elements: 27
- Open shadow roots detected: 0
- Iframes detected: 0

## Accessibility Violations By Rule

- button-name: critical; nodes: 1
- color-contrast: serious; nodes: 3
- html-has-lang: serious; nodes: 1
- image-alt: critical; nodes: 1
- page-has-heading-one: moderate; nodes: 1
- region: moderate; nodes: 2

## Repeated Issues

### Elements with missing labels

- None detected.

### Icon-only controls without meaningful accessible names

- icon-only button: Icon-only control has no meaningful accessible name. Count: 1; priority: High

### Duplicate HTML id values

- None detected.

### CSS-class-only locator risks

- none element: Element currently risks requiring CSS-class-only locators. Count: 1; priority: Medium

### Long DOM-path locator risks

- link: Diagnostic DOM path is long and would be brittle as a locator. Count: 12; priority: Medium
- standard button: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium
- search field: Diagnostic DOM path is long and would be brittle as a locator. Count: 1; priority: Medium

### Generic div elements that behave like buttons

- None detected.

### Custom dropdown-like components

- None detected.

## Existing Useful Data-testid Values

- None detected.

## Missing Recommended Data-testid Values

- icon-only button: Icon-only control has no meaningful accessible name. Recommended locator: `page.getByRole('button', { name: /Describe action/i })`
- none element: Element currently risks requiring CSS-class-only locators. Recommended locator: `page.getByRole('none', { name: /Meaningful control name/i })`
