# DOM and Accessibility - Konfiguration / Aktivitaten Setup

## Source
- ui-audit/pages/configuration/activities-setup/default/accessibility-report.json
- ui-audit/pages/configuration/activities-setup/default/interactive-elements.json
- ui-audit/pages/configuration/activities-setup/default/sanitized-dom.html
- ui-audit/pages/configuration/activities-setup/default/IMPROVEMENTS.md

---

## Accessibility Tree

### Summary
| Metric | Count |
|--------|-------|
| Violations | 6 |
| Passes | 39 |
| Incomplete | 0 |
| Inapplicable | 47 |
| Total Interactive Elements | 38 |

### Violations

| Impact | Rule ID | Description | Nodes |
|--------|---------|-------------|-------|
| SERIOUS | aria-command-name | Ensure every ARIA button/link/menuitem has an accessible name | 10 |
| SERIOUS | color-contrast | Ensure contrast meets WCAG 2 AA minimum thresholds | 2 |
| SERIOUS | html-has-lang | Ensure every HTML document has a lang attribute | 1 |
| CRITICAL | image-alt | Ensure img elements have alternative text | 1 |
| MODERATE | page-has-heading-one | Ensure the page contains a level-one heading | 1 |
| MODERATE | region | Ensure all page content is contained by landmarks | 2 |

### Incomplete (Needs Review)
None detected.

---

## Key DOM Structure

Same Mashroom portal shell as Regime. Aktivitaten Setup loads inside id=door2door-root.
Notable differences: no search field, smaller table (10 rows vs 34), different columns.



---

## Page Notes

From IMPROVEMENTS.md:

- Capture type: configured route sweep
- Total interactive elements: 38
- Open shadow roots detected: 0
- Iframes detected: 0

### Accessibility Violations By Rule
- aria-command-name: serious; nodes: 10
- color-contrast: serious; nodes: 2
- html-has-lang: serious; nodes: 1
- image-alt: critical; nodes: 1
- page-has-heading-one: moderate; nodes: 1
- region: moderate; nodes: 2

### Repeated Issues

**Icon-only controls without accessible names**
- row action button: Count 10; priority High

**CSS-class-only locator risks**
- none element: Count 1; priority Medium

**Long DOM-path locator risks**
- link: Count 12; priority Medium
- standard button: Count 1; priority Medium

**Generic div elements that behave like buttons**
- Filter tabs (Neubau / FTTH-Ausbau / Bestandsbau): Count 3; priority High

### Existing Useful Data-testid Values
- None on the Aktivitaten Setup content itself.
- data-testid=microflow-wrapper exists at portal wrapper level only.

### Missing Recommended Data-testid Values
- row action button (x10) -> page.getByRole(button, { name: /Open row details/i })
- none element (x1) -> page.getByRole(none, { name: /Meaningful control name/i })

### Representative Playwright Locators
- Nav links: page.getByRole(link, { name: /Baulose/i })
- Sub-nav active: page.getByRole(link, { name: /Aktivitaten Setup/i })
- Create button: page.getByRole(button, { name: /Setup erstellen/i })
- Filter tabs: page.getByRole(button, { name: /Neubau/i }) (currently divs - brittle)
- Table rows by text: page.getByRole(row).filter({ hasText: /Neubau/ })
