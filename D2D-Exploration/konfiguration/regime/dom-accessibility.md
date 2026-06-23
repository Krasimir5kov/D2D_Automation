# DOM & Accessibility — Konfiguration / Regime

## Source
- `ui-audit/pages/configuration/regime/default/accessibility-report.json`
- `ui-audit/pages/configuration/regime/default/interactive-elements.json`
- `ui-audit/pages/configuration/regime/default/sanitized-dom.html`
- `ui-audit/pages/configuration/regime/default/IMPROVEMENTS.md`

---

## Accessibility Tree

### Summary
| Metric | Count |
|--------|-------|
| Violations | 8 |
| Passes | 44 |
| Incomplete | 0 |
| Inapplicable | 42 |
| Total Interactive Elements | 132 |

### Violations

| Impact | Rule ID | Description | Nodes Affected |
|--------|---------|-------------|----------------|
| SERIOUS | `aria-command-name` | Ensure every ARIA button, link and menuitem has an accessible name | 68 |
| CRITICAL | `button-name` | Ensure buttons have discernible text | 1 |
| SERIOUS | `color-contrast` | Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds | 4 |
| SERIOUS | `html-has-lang` | Ensure every HTML document has a lang attribute | 1 |
| CRITICAL | `image-alt` | Ensure img elements have alternative text or a role of none or presentation | 1 |
| SERIOUS | `nested-interactive` | Ensure interactive controls are not nested as announced by screen readers | 34 |
| MODERATE | `page-has-heading-one` | Ensure that the page contains a level-one heading | 1 |
| MODERATE | `region` | Ensure all page content is contained by landmarks | 2 |

### Incomplete (Needs Review)
None detected.

---

## Key DOM Structure

The page renders inside the Mashroom portal shell. The D2D app loads as a nested
widget under `data-mr-app-name="Door2Door"`. Regime content is inside `id="door2door-root"`.

```
body
  header                               <- portal header (logo, meta-nav, user menu)
  main
    nav                                <- portal sidebar nav (Home, Door2Door, Timey...)
    .mashroom-portal-apps-container
      #app-area1
        [data-mr-app-name="Door2Door Microflow"]
          [data-testid="microflow-wrapper"]   <- only data-testid on this page
            [data-mr-app-name="Door2Door"]
              #door2door-root
                .p3KrfoLZtRg_pRRl5JTQ         <- main layout wrapper
                  .Q37u00yVoVbXmnceJuU4       <- top nav (D2D section links)
                    ul: Baulose / Objekte / Sales Action /
                        Benutzerverwaltung / Importe / Konfiguration
                  .sGJmjGN4G6b68s7knhoD       <- page body
                    .EHlDZlTv7vV3eznMQ6ju     <- sub-nav: Konfiguration section
                      a: Ubersicht / Abschlussgrunde / Aufgaben /
                         Gruppen / [Regime aria-current=page] / Aktivitaten Setup
                    .UDYvdG45wMOJbQlRI5hA     <- page content area
                      h2 "Regime"             <- section heading (no id)
                      button "Regime erstellen"  <- create action (no data-testid)
                      input#regime-search-field  <- search (id = usable locator)
                      .DntgWQkqJW3kBWnGZM5x   <- filter tabs (divs with role=button)
                        div[role="button"] "Neubau"
                        div[role="button"] "FTTH-Ausbau"
                        div[role="button"] "Bestandsbau"
                      "34 Ergebnisse"         <- result count text
                      table.Regimes_Table_View
                        thead: ID / Objekttyp / Regime Anzeigename /
                               SUB_TYPE / erstellt am / (actions)
                        tbody: rows; each row has icon-only action buttons (no labels)
```

---

## Page Notes

From `IMPROVEMENTS.md`:

- Capture type: configured route sweep
- Total interactive elements: 132
- Open shadow roots detected: 0
- Iframes detected: 0

### Accessibility Violations By Rule
- `aria-command-name`: serious; nodes: 68
- `button-name`: critical; nodes: 1
- `color-contrast`: serious; nodes: 4
- `html-has-lang`: serious; nodes: 1
- `image-alt`: critical; nodes: 1
- `nested-interactive`: serious; nodes: 34
- `page-has-heading-one`: moderate; nodes: 1
- `region`: moderate; nodes: 2

### Repeated Issues

**Icon-only controls without meaningful accessible names**
- row action button: Count 68; priority High
- icon-only create button: Count 1; priority High

**CSS-class-only locator risks**
- table row: Count 34; priority Medium
- none element: Count 1; priority Medium

**Long DOM-path locator risks**
- link: Count 12; priority Medium
- standard button: Count 1; priority Medium
- search field: Count 1; priority Medium

**Generic div elements that behave like buttons**
- Filter tabs (Neubau / FTTH-Ausbau / Bestandsbau): Count 3; priority High

### Existing Useful Data-testid Values
- None on the Regime content. `data-testid="microflow-wrapper"` is portal-level only.

### Missing Recommended Data-testid Values
- `icon-only button` -> `page.getByRole('button', { name: /Describe action/i })`
- `table row` (x34) -> `page.getByRole('none', { name: /Meaningful control name/i })`
- `row action button` (x68) -> `page.getByRole('button', { name: /Open row details/i })`

### Representative Playwright Locators
- Nav links: `page.getByRole('link', { name: /Baulose/i })`
- Sub-nav active: `page.getByRole('link', { name: /Regime/i })`
- Search field: `#regime-search-field`
- Create button: `page.getByRole('button', { name: /Regime erstellen/i })`
- Filter tabs: `page.getByRole('button', { name: /Neubau/i })` (currently divs — brittle)
