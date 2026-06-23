# Locator Audit Summary — D2D Application

**Generated:** 2026-06-23  
**Source data:** DOM inspection run 2026-06-20  
**Evidence scope:** 28 captured page/state folders, 68 predefined filter/dropdown folders, 41,902 interactive element records

---

## Key Statistics

| Metric | Count |
|--------|-------|
| `div[role="button"]` controls | **1,769** |
| Native `<button>` elements | **77** |
| Inputs / textareas / selects | 181 |
| `aria-label` attributes | **0** |
| `aria-labelledby` attributes | **0** |
| `aria-describedby` attributes | **0** |
| `aria-expanded` attributes | **0** |
| `aria-controls` attributes | **0** |
| `aria-selected` attributes | **0** |
| `aria-checked` attributes | **0** |
| `data-testid` attributes | **15** |
| Button-like controls without obvious name | **1,523** |
| Form controls without label/name/placeholder | 156 |
| Rendered dropdown option records | 494 |
| Dropdown options with `data-testid` | 0 |
| Dropdown options with `data-option-value` | 0 |
| Dropdown options with `aria-selected` | 0 |

> The 15 `data-testid` values present are exclusively on search input fields (e.g., `baulose-search-field`, `objects-search-field`, `imports-search-field`, `shared-search-field`). No interactive button, filter trigger, table row, or side panel has a `data-testid`.

---

## Current DOM Problems

### Summary

The D2D DOM is interactive and visually correct, but the automation and accessibility contracts needed for stable Playwright testing are almost entirely absent. Generated CSS class names (from the GUCCI component library) are currently forced to act as the locator contract because stable identity, state, relationship, and accessible-name attributes are missing from the rendered nodes.

### Problem 1: Filter Triggers Are Unlabeled `div[role="button"]` Nodes

Every filter dropdown trigger in the app is a `div[role="button"]` with a generated class fragment (e.g., `HePyFz5n_qN7wvTgUrv1`) and no:
- `data-testid`
- `data-filter-name`
- `aria-expanded`
- `aria-controls`
- `aria-haspopup`

There is also a nested icon `div[role="button"]` inside each trigger — a second focusable control embedded in the first, making the DOM structure a component-quality issue regardless of locator strategy.

**Current DOM example (Organisation filter trigger):**
```html
<div tabindex="0" role="button" class="HePyFz5n_qN7wvTgUrv1">
  Organisation
  <div class="gucci-icon-button-v2 secondary" role="button" tabindex="0">
    <div class="gucci-icon-v2"><svg ...></svg></div>
  </div>
</div>
```

**Impact:** Playwright must use `getByRole('button', { name: 'Organisation' })` which is MODERATE stability — breaks on text translation or label change.

---

### Problem 2: Dropdown Options Are Repeated Generated Nodes With No Identity

All 494 captured dropdown option nodes use `div[role="button"]` with generated classes. None have:
- `data-testid`
- `data-option-value`
- `aria-selected`
- `aria-checked`

**Current DOM example:**
```html
<div class="KntuDGWGc13zOnf5Ptal" role="button" tabindex="0">
  <span class="HUnpEk8_FSUbffD_Cuvc">
    <span><span class="">A1 Shop Franchise Oberwart/PADO/EKZ</span></span>
  </span>
</div>
```

**Impact:** Options can only be targeted by visible text (`getByText()`), which fails for long or dynamically loaded option lists, non-unique labels, or translated content.

---

### Problem 3: Search Icon Buttons Have No Accessible Name

Search fields have IDs (e.g., `objects-search-field`) but their companion icon buttons are empty — no `aria-label`, no text content, no `data-testid`.

**Current DOM:**
```html
<input id="objects-search-field" type="text" autocomplete="off" spellcheck="false">
<button class="search-button icon-a1-lupe" type="button"></button>
```

**Impact:** Playwright cannot use `getByRole('button', { name: ... })` for the search button. Falls back to class-based selectors.

---

### Problem 4: Row Action Buttons Depend on DOM Order

Row action buttons (icon buttons in table rows) have no accessible names. Playwright must use positional selectors:

```typescript
page.locator('tr, [role="row"]').filter({ hasText: text }).locator('button').last()
```

Evidence: 56 row-action icon buttons without meaningful accessible names across the Sales Actions side panel view, 25 table rows at class-only locator risk.

---

### Problem 5: Side Panels Are Located by Generated Class Fragments

```typescript
page.locator('[class*="SidePanel"]').first()
```

The side panel wrapper node has no `data-testid`, no `data-panel-name`, and no accessible panel name. The close button is an icon-only nested generated control.

---

### Problem 6: Complex Form Inputs Are Missing Labels

In Sales Action side panels: 26 form controls missing a visible label or accessible name, 26 `label` axe violation nodes. Playwright cannot use `getByLabel()` for these fields.

---

### Problem 7: Tables and Rows Have No Stable Identifiers

Tables use `[class*="Table"]` fallback locators. Rows have no `data-testid` or business-entity identifiers (e.g., `data-object-id`, `data-sales-action-id`).

---

### Problem 8: Modal Close Buttons Are Empty and Order-Dependent

```typescript
dialog(page).locator('button').filter({ hasText: /^$/ }).first()
```

Dialogs can have multiple empty icon buttons. The current pattern depends on DOM order, not button purpose.

---

### Problem 9: File Uploaders Are Class/Type Fallbacks

```typescript
page.locator('[class*="FileUploader"], input[type="file"]').first()
```

Fragile if more uploaders are added or component library class names change.

---

### Problem 10: Toast and Loading Regions Are Not Reliable Status Contracts

```typescript
page.locator('[class*="Toast"], [role="alert"], [role="status"]').first()
page.locator('[class*="Loading"], [class*="Placeholder"]').first()
```

Toast uses a class fragment. Loading uses a class fragment. Neither has a `data-testid` or stable `aria-live` region contract.

---

## Per-Page Statistics

Computed from `button-inventory.json` (all 185 button records across 6 pages).

| Page | Total Buttons | Has data-testid | Has aria-label | Has id | Class-only / Unlabeled |
|------|:------------:|:---------------:|:--------------:|:------:|:----------------------:|
| Baulose | 18 | 0 | 0 | 0 | 11 (no text label) |
| Objekte | 31 | 0 | 0 | 0 | 17 (no text label) |
| Sales Actions | 31 | 0 | 0 | 0 | 17 (no text label) |
| Benutzerverwaltung | 67 | 0 | 0 | 0 | 57 (no text label) |
| Importe | 38 | 0 | 0 | 0 | 6 (no text label) |
| Konfiguration | 0 | 0 | 0 | 0 | 0 |
| **TOTAL** | **185** | **0** | **0** | **0** | **108 (58%)** |

> The `data-testid` count of 15 (mentioned in the presentation) comes from the broader DOM evidence (41,902 element records), not just the button inventory. Those 15 testids are on search input fields, not buttons.

**Buttons with meaningful text labels (locatable by `getByRole` + text):**

| Page | Named buttons | Examples |
|------|:------------:|---------|
| Baulose | 7 | Organisation, Regime, Phase, Status, zu Sales Actions, 25, 1 |
| Objekte | 14 | alle Filter, nicht übergeben, zurückgewiesen, übergeben, Baulos/Einsatzname, PLZ, Organisation, Verkaufsstart, Fragebogen, 25, 1 (+ 3 duplicates) |
| Sales Actions | 14 | (identical to Objekte) |
| Benutzerverwaltung | 10 | Benutzer erstellen, Team erstellen, Admin A1 erstellen, aktiv, inaktiv, ohne Rolle, Organisation, Rolle, 25, 1 |
| Importe | 32 | Organisation wechseln, Daten importieren, System Import, Datei Import, Importdatum, Organisation, Benutzer, Rückgängig machen ×21, 25, 1 |
| Konfiguration | 0 | — |

**Safety class distribution (across all 185 buttons):**

| Safety Class | Count |
|-------------|:-----:|
| UNKNOWN | 170 |
| SAFE_NAVIGATION | 4 |
| SAFE_OPEN | 2 |
| RISKY_DATA_CHANGE | 9 |

---

## Existing Playwright Locators

From `door2door-playwright-locators.ts` — the current locator library documents 9 functional groups with ~120 individual locators.

### Locator Strategy Summary

| Strategy | Count (approx.) | Stability | Examples |
|----------|:--------------:|-----------|---------|
| `getByRole('button', { name })` | ~40 | MODERATE | All named filter buttons, create buttons |
| `getByRole('link', { name })` | ~15 | MODERATE | All navigation links |
| `getByRole('tab', { name })` | ~15 | MODERATE | Page tabs (Neubau, FTTH, Bestandsbau) |
| `getByLabel()` | ~12 | MODERATE–STABLE | Form fields with labels (user form, team form) |
| `getByPlaceholder()` | ~8 | MODERATE | Search inputs |
| `getByRole('dialog')` | ~15 | STABLE | Modal detection |
| `getByText()` | ~5 | MODERATE | Error states, app mark |
| `[class*="..."]` | ~20 | **FRAGILE** | Side panels, tables, loaders, toasts, file uploaders |
| `.first()` / `.last()` | ~10 | **FRAGILE** | Context menus, close icons, search buttons |
| `filter({ hasText: /^$/ })` | ~3 | **FRAGILE** | Modal close icon buttons |

### Fragile Locators (Highest Risk)

These locators depend on generated class names, DOM order, or both and will break when the component library version changes or DOM structure is refactored:

```typescript
// Side panels — generated class, no stable identity
page.locator('[class*="SidePanel"]').first()
page.locator('[class*="SidePanel"]').getByRole('button').first()  // close button

// Tables — multiple class alternatives needed
page.locator('table, [role="table"], [class*="Table"]').first()

// Row context menu — positional, last button in row
page.locator('tr, [role="row"]').filter({ hasText: text }).locator('button').last()

// Modal close icon — empty button, first match
dialog(page).locator('button').filter({ hasText: /^$/ }).first()

// File uploader — class fragment fallback
page.locator('[class*="FileUploader"], input[type="file"]').first()

// Toast / loading — class fragments
page.locator('[class*="Toast"], [role="alert"], [role="status"]').first()
page.locator('[class*="Loading"], [class*="Placeholder"]')

// Action bar — class fragment
page.locator('[class*="ActionBar"], [class*="Actions"], [class*="LinkButtons"]').first()

// Questionnaire section — class fragment
page.locator('[class*="Questionnaire"], [class*="Question"]').first()

// Customer interactions — class fragment
page.locator('[class*="CustomerInteraction"], [class*="Accordion"]').first()

// Documents section — class fragment
page.locator('[class*="Documents"], [class*="FileUploader"]').first()

// MultiSelect / combobox — class fragment
page.locator('[class*="MultiSelect"], [role="combobox"]').first()

// App root — class fragment
page.locator('#root, [class*="WidgetStyle"]').first()

// Header — class fragment
page.locator('header, [class*="HeaderStyle"]').first()
```

### Moderately Stable Locators (Text-Dependent)

These work today but break on UI text translation, label rename, or German character encoding issues:

```typescript
page.getByRole('button', { name: 'Organisation' })     // shared across 5 pages
page.getByRole('button', { name: 'alle Filter' })      // Objekte + Sales Actions
page.getByRole('button', { name: 'Rückgängig machen' }) // Importe — 21 duplicates per page
link(page, exact('Baulose'))                            // navigation
```

### Stable Locators

```typescript
page.getByRole('dialog')                               // modal detection — STABLE
page.getByLabel(/Benutzername|Username/i)              // user form — has label
page.getByLabel(/Vorname/i)                            // user form — has label
page.getByLabel(/Teambezeichnung/i)                    // team form — has label
page.getByText('Technischer Fehler')                   // error state — unique text
page.getByText('Missing Permissions')                  // permission error — unique text
```

---

## Recommended Fixes

### Additive Approach (Do Not Break Existing DOM)

The recommended fix is **additive only** — keep existing GUCCI/generated classes, `role`, and `tabindex`. Add only the missing stable attributes to the final rendered nodes.

### Fix 1: Filter Dropdown Triggers

Add to each filter trigger node:
```html
aria-haspopup="listbox"
aria-expanded="false"
aria-controls="[page]-filter-[name]-options"
data-testid="[page]-filter-[name]-trigger"
data-filter-name="[name]"
```

On the nested icon button:
```html
aria-label="Open [Name] filter"
data-testid="[page]-filter-[name]-icon"
```

**Future locator:** `page.getByTestId('objects-filter-organisation-trigger')`

### Fix 2: Dropdown Option Nodes

Add to each option in a filter dropdown:
```html
data-testid="[page]-filter-[name]-option"
data-option-value="[stable-slug]"
aria-selected="false"   <!-- or aria-checked for multi-select -->
```

**Future locator:** `page.locator('[data-testid="objects-filter-organisation-option"][data-option-value="network-nord"]')`

### Fix 3: Search Icon Button

Add to the empty search button:
```html
aria-label="Search [context]"
data-testid="[page]-search-button"
```

Add to the search input:
```html
name="[contextSearch]"
data-testid="[page]-search-input"
```

**Future locator:** `page.getByRole('button', { name: 'Search objects' })`

### Fix 4: Row Action Buttons

Add to table rows:
```html
data-testid="[page]-row"
data-[entity]-id="[stable-id]"
```

Add to the icon button in each row:
```html
aria-label="Open [entity] row actions"
data-testid="[page]-row-actions-button"
```

**Future locator:**
```typescript
const row = page.locator('[data-testid="sales-actions-row"][data-sales-action-id="123"]');
row.getByRole('button', { name: 'Open sales action row actions' });
```

### Fix 5: Side Panels

Add to the side panel wrapper:
```html
aria-label="[Entity] details"
data-testid="[page]-[entity]-side-panel"
data-panel-name="[entity]-details"
```

Add to the close button:
```html
aria-label="Close [entity] details"
data-testid="[page]-[entity]-side-panel-close"
```

**Future locators:**
```typescript
page.getByTestId('objects-details-side-panel')
page.getByRole('button', { name: 'Close object details' })
```

### Fix 6: Form Inputs in Side Panels

For the 26 unlabeled form controls in Sales Action side panels:
```html
<label id="appointment-date-label" for="appointment-date-input">Appointment date</label>
<input id="appointment-date-input" aria-labelledby="appointment-date-label" data-testid="sales-actions-appointment-date-input">
```

**Future locator:** `page.getByLabel('Appointment date')`

### Fix 7: Tables

Add to the table element:
```html
data-testid="[page]-table"
```

**Future locator:** `page.getByTestId('objects-table')`

### Fix 8: Modal Close Buttons

Add to modal root:
```html
role="dialog"
aria-modal="true"
aria-labelledby="[modal-title-id]"
data-testid="[modal-name]-dialog"
```

Add to close button:
```html
aria-label="Close dialog"
data-testid="[modal-name]-dialog-close"
```

**Future locator:** `page.getByRole('button', { name: 'Close dialog' })`

### Fix 9: File Uploaders

```html
<div class="generated-class" data-testid="imports-file-uploader">
  <input type="file" aria-label="Upload import file" data-testid="imports-file-input">
</div>
```

**Future locator:** `page.getByTestId('imports-file-input')`

### Fix 10: Toast and Loading Regions

```html
<div role="status" aria-live="polite" data-testid="app-toast">...</div>
<section aria-busy="true" data-testid="[page]-results-section">...</section>
```

---

## Priority Elements for data-testid

Ordered by automation impact (highest risk / most frequently used in tests first):

### Priority 1 — Immediate (Blocks Basic Test Authoring)

| Element | Suggested data-testid | Why |
|---------|----------------------|-----|
| Objects table | `objects-table` | Every objects test needs stable table scope |
| Sales Actions table | `sales-actions-table` | Every SA test needs stable table scope |
| Baulose table | `baulose-table` | Every baulose test needs stable table scope |
| Objects detail side panel | `objects-details-side-panel` | Currently only located by generated class |
| Sales Action detail side panel | `sales-action-details-side-panel` | Same issue — most tested panel |
| Side panel close button | `[panel]-side-panel-close` | Every panel close test is currently positional |
| Modal close button (any) | `[modal-name]-dialog-close` | Currently `filter({ hasText: /^$/ }).first()` |
| Objects table row | `objects-row` + `data-object-id` | Row-level test scoping |
| Sales Actions table row | `sales-actions-row` + `data-sales-action-id` | Row-level test scoping |

### Priority 2 — High (Filter Automation)

| Element | Suggested data-testid | Why |
|---------|----------------------|-----|
| Objects filter: Organisation trigger | `objects-filter-organisation-trigger` | Most used filter in tests |
| Objects filter: Organisation option | `objects-filter-organisation-option` + `data-option-value` | Option selection currently text-only |
| Objects filter: Baulos/Einsatzname trigger | `objects-filter-baulose-trigger` | Second most used filter |
| Objects filter: PLZ trigger | `objects-filter-plz-trigger` | PLZ range filter |
| Objects filter: Verkaufsstart trigger | `objects-filter-verkaufsstart-trigger` | Date range filter |
| Sales Actions: same filter set | `sales-actions-filter-*` | Mirror of Objects filters |
| Alle Filter modal | `all-filters-modal` | Better than `getByRole('dialog')` in multi-modal scenarios |

### Priority 3 — Medium (User Administration)

| Element | Suggested data-testid | Why |
|---------|----------------------|-----|
| Users table | `users-table` | Admin test scope |
| Users table row | `users-row` + `data-user-id` | Row-level admin tests |
| Teams table | `teams-table` | Admin test scope |
| Teams table row | `teams-row` + `data-team-id` | Row-level admin tests |
| Create User dialog | `create-user-dialog` | Currently `filter({ hasText: /Benutzer erstellen/i })` |
| Create Team dialog | `create-team-dialog` | Currently `filter({ hasText: /Team erstellen/i })` |
| User side panel | `user-details-side-panel` | Currently class fragment filter |
| Team side panel | `team-details-side-panel` | Currently class fragment filter |

### Priority 4 — Medium (Import Flow)

| Element | Suggested data-testid | Why |
|---------|----------------------|-----|
| Import file input | `imports-file-input` | Currently class+type fallback |
| Import dialog | `import-objects-dialog` | Multi-step wizard needs stable root |
| Importe table | `imports-table` | Table scope for import log |
| Revert import confirm dialog | `revert-import-dialog` | Confirmation modal |

### Priority 5 — Lower (Konfiguration, Toasts, Loading)

| Element | Suggested data-testid | Why |
|---------|----------------------|-----|
| App toast/notification | `app-toast` | Currently class fragment fallback |
| Results section (loading) | `[page]-results-section` | Currently class fragment fallback |
| Configuration tables | `config-[section]-table` | Admin-only, lower test frequency |
| Row context menus | `[page]-row-context-menu` | Currently `.last()` positional |
| Baulose filter triggers | `baulose-filter-[name]-trigger` | Lower risk than Objekte/SA |

---

## Target Future Locator Strategy

Once `data-testid` and ARIA attributes are added, the preferred locator order should be:

1. `getByTestId()` — for repeated, dynamic, icon-only, or hard-to-scope controls
2. `getByRole()` — when the element has a stable accessible name (headings, labeled buttons)
3. `getByLabel()` — for form fields with proper labels
4. `getByText()` — only when visible text is stable, unique, and won't be translated
5. Short `data-*` attribute selectors — for repeated rows/options (`[data-object-id="123"]`)

**Avoid** going forward: `[class*="GeneratedName"]`, `.first()`, `.last()`, long DOM paths, XPath.

### Third-Party Pass-Through Checklist

For each GUCCI/component, verify that added attributes reach the **final rendered DOM node**:

- [ ] button/icon-button attributes reach the final clickable button-like node
- [ ] dropdown trigger attributes reach the final trigger div
- [ ] dropdown option attributes reach every repeated option node
- [ ] input attributes reach the final `input`, `textarea`, `select`, or file input
- [ ] table/row attributes reach the actual `table` and `tr` nodes
- [ ] side-panel/modal attributes reach the visible wrapper and close button
- [ ] decorative SVG/icon nodes receive `aria-hidden="true"`
