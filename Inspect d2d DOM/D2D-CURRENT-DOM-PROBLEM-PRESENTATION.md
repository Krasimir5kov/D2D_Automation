<!--
Presentation-style Markdown deck.
Use the `---` separators as slide breaks in Marp, reveal-md, or plain Markdown preview.
-->

# D2D Current DOM Problem

## Additive attribute proposal for stable Playwright automation

Evidence source:

- `ui-audit/pages/**/sanitized-dom.html`
- `ui-audit/pages/**/interactive-elements.json`
- `ui-audit/predefined-filter-audit-runs/**`
- `door2door-playwright-locators.ts`

Main rule: do not remove, rename, or replace the existing GUCCI/generated classes. Add only stable attributes to the final rendered DOM nodes.

---

# Why This Matters

The current DOM is usable by a human, but many automation and accessibility contracts are missing from the rendered nodes.

The result is that Playwright has to depend on:

- generated class fragments such as `[class*="SidePanel"]`, `[class*="Table"]`, `[class*="Filter"]`
- generic order selectors such as `.first()` and `.last()`
- long DOM paths through generated wrappers
- repeated `div role="button"` structures with the same generated classes

This makes tests fragile when layout, library output, translation, row order, or wrapper structure changes.

---

# Captured Evidence Scope

From `ALL-CURRENT-DOM-ATTRIBUTE-RECOMMENDATIONS.md`:

| Evidence | Count |
| --- | ---: |
| Captured page/state folders | 28 |
| Predefined filter/dropdown folders | 68 |
| Interactive page element records | 41,902 |
| Rendered dropdown option records | 494 |
| Accessibility report files | 96 |
| Axe violation nodes | 35,490 |

This is based on the current captured D2D DOM in this workspace, not on a theoretical component list.

---

# Current Attribute Gap

Across captured page interactive elements:

| Attribute/category | Current count |
| --- | ---: |
| `div role="button"` controls | 1,769 |
| Native button elements | 77 |
| Inputs/textareas/selects | 181 |
| `aria-label` | 0 |
| `aria-labelledby` | 0 |
| `aria-describedby` | 0 |
| `aria-expanded` | 0 |
| `aria-controls` | 0 |
| `aria-selected` | 0 |
| `aria-checked` | 0 |
| `data-testid` | 15 |
| Button-like controls without obvious name | 1,523 |
| Form controls without obvious label/name/placeholder | 156 |

The missing attributes are exactly the attributes Playwright and accessibility tooling use to create stable, user-facing locators.

---

# Current Locator Impact

Current examples from `door2door-playwright-locators.ts`:

```ts
page.locator('[class*="SidePanel"]').first()
page.locator('table, [role="table"], [class*="Table"]').first()
page.locator('tr, [role="row"]').filter({ hasText: text }).locator('button').last()
dialog(page).locator('button').filter({ hasText: /^$/ }).first()
page.locator('[class*="FileUploader"], input[type="file"]').first()
page.locator('[class*="Toast"], [role="alert"], [role="status"]').first()
```

These are understandable fallbacks for the current DOM, but they should not be the long-term automation contract.

---

# Problem 1: Filter Trigger Is Only A Generated Button-like Div

Current captured DOM, `objects / neubau-list / Organisation`:

```html
<div tabindex="0" role="button" class="HePyFz5n_qN7wvTgUrv1">
  Organisation
  <div class="gucci-icon-button-v2 secondary" role="button" tabindex="0">
    <div class="gucci-icon-v2">
      <svg viewBox="[REDACTED]" xmlns="http://www.w3.org/2000/svg">...</svg>
    </div>
  </div>
</div>
```

Current missing contract:

- no `data-testid`
- no `data-filter-name`
- no `aria-expanded`
- no `aria-controls`
- nested button-like icon inside another button-like trigger

---

# Recommended Additive Fix: Filter Trigger

Keep the current classes, `role`, `tabindex`, and nested generated structure. Add attributes to the final clickable trigger node.

```html
<div
  tabindex="0"
  role="button"
  class="HePyFz5n_qN7wvTgUrv1"
  aria-haspopup="listbox"
  aria-expanded="false"
  aria-controls="objects-filter-organisation-options"
  data-testid="objects-filter-organisation-trigger"
  data-filter-name="organisation"
>
  Organisation
  <div
    class="gucci-icon-button-v2 secondary"
    role="button"
    tabindex="0"
    aria-label="Open Organisation filter"
    data-testid="objects-filter-organisation-icon"
  >
    <div class="gucci-icon-v2">
      <svg aria-hidden="true" viewBox="[REDACTED]" xmlns="http://www.w3.org/2000/svg">...</svg>
    </div>
  </div>
</div>
```

Note: the nested button-like icon remains a component-quality issue. If the icon is only decorative, frontend should verify whether the GUCCI component can pass decoration attributes to the rendered icon without exposing it as a second focusable control.

Future locator:

```ts
page.getByTestId('objects-filter-organisation-trigger')
```

---

# Problem 2: Dropdown Options Are Repeated Generated Nodes

Current captured option, `objects / neubau-list / Organisation`:

```html
<div class="KntuDGWGc13zOnf5Ptal" role="button" tabindex="0">
  <span class="HUnpEk8_FSUbffD_Cuvc">
    <span><span class="">A1 Shop Franchise Oberwart/PADO/EKZ</span></span>
  </span>
</div>
```

Current dropdown option inventory:

| Attribute/category | Count |
| --- | ---: |
| Rendered option records | 494 |
| Option tags `div` | 484 |
| Options with `data-testid` | 0 |
| Options with `data-option-value` | 0 |
| Options with `aria-selected` | 0 |
| Options with `aria-checked` | 0 |

---

# Recommended Additive Fix: Dropdown Options

Keep the generated option class. Add a shared test id and a stable value attribute.

```html
<div
  class="KntuDGWGc13zOnf5Ptal"
  role="button"
  tabindex="0"
  data-testid="objects-filter-organisation-option"
  data-option-value="a1-shop-franchise-oberwart"
  aria-selected="false"
>
  <span class="HUnpEk8_FSUbffD_Cuvc">
    <span><span class="">A1 Shop Franchise Oberwart/PADO/EKZ</span></span>
  </span>
</div>
```

Use `aria-selected` only if the option behaves like a single-select listbox option. Use `aria-checked` if the option behaves like a checkbox or multi-select option.

Future locator:

```ts
page.locator('[data-testid="objects-filter-organisation-option"][data-option-value="a1-shop-franchise-oberwart"]')
```

---

# Problem 3: Search Icon Button Has No Name

Current captured DOM:

```html
<input id="objects-search-field" type="text" autocomplete="off" spellcheck="false" value="[REDACTED]">
<button class="search-button icon-a1-lupe" type="button"></button>
```

Current problem:

- the search input has an `id`, but no `name`, `data-testid`, or explicit automation contract
- the icon button is empty
- there is no `aria-label` on the icon-only button
- Playwright cannot reliably use `getByRole('button', { name: ... })`

---

# Recommended Additive Fix: Search Field And Button

Keep the current input `id`, current input type, and button classes. Add a label/name contract and an accessible button name.

```html
<label for="objects-search-field">Search objects</label>
<input
  id="objects-search-field"
  name="objectsSearch"
  type="text"
  autocomplete="off"
  spellcheck="false"
  data-testid="objects-search-input"
>

<button
  class="search-button icon-a1-lupe"
  type="button"
  aria-label="Search objects"
  data-testid="objects-search-button"
></button>
```

Future locators:

```ts
page.getByLabel('Search objects')
page.getByRole('button', { name: 'Search objects' })
```

---

# Problem 4: Row Action Buttons Depend On DOM Order

Current locator pattern:

```ts
page
  .locator('tr, [role="row"]')
  .filter({ hasText: text })
  .locator('button')
  .last()
```

Current captured row-action style:

```html
<div role="button" class="lWP4Fqupq8L9ODulAGCA" tabindex="0">
  <div class="gucci-icon-button-v2 secondary" role="button" tabindex="0">
    <div class="gucci-icon-v2">
      <svg viewBox="0 0 20 32" xmlns="http://www.w3.org/2000/svg">...</svg>
    </div>
  </div>
</div>
```

Sales Actions side-panel evidence:

- 56 row-action icon buttons without meaningful accessible names
- 25 table rows at CSS-class-only locator risk
- 25 table rows with long DOM-path locator risk

---

# Recommended Additive Fix: Rows And Row Actions

Add row identity to the row and action identity to the action control.

```html
<tr
  class="_0sLeWN9iFu4_KyLTsdzA false B1UBG9IYgc3eGfcqp1qY"
  data-testid="sales-actions-row"
  data-sales-action-id="<stable-id>"
>
  ...
  <td>
    <div
      role="button"
      class="lWP4Fqupq8L9ODulAGCA"
      tabindex="0"
      aria-label="Open sales action row actions"
      data-testid="sales-actions-row-actions-button"
    >
      <div
        class="gucci-icon-button-v2 secondary"
        role="button"
        tabindex="0"
        aria-label="Open sales action row actions"
      >
        ...
      </div>
    </div>
  </td>
</tr>
```

Future locator:

```ts
const row = page.locator('[data-testid="sales-actions-row"][data-sales-action-id="<stable-id>"]');
row.getByRole('button', { name: 'Open sales action row actions' });
```

---

# Problem 5: Side Panels Are Located By Generated Class

Current locator pattern:

```ts
page.locator('[class*="SidePanel"]').first()
```

Current captured side-panel-like wrapper class appears as generated CSS, for example:

```html
<div class="CQMDxIkbLhbnLsalpqD7">
  <div>...</div>
</div>
```

Current problem:

- generated class is not a stable product contract
- no `data-testid`
- no `data-panel-name`
- no accessible panel name
- close button often appears as an icon-only nested generated control

---

# Recommended Additive Fix: Side Panel

Add identity to the visible panel wrapper and accessible name to the close control.

```html
<div
  class="CQMDxIkbLhbnLsalpqD7"
  aria-label="Object details"
  data-testid="objects-details-side-panel"
  data-panel-name="object-details"
>
  <div>
    ...
    <button
      type="button"
      aria-label="Close object details"
      data-testid="objects-details-side-panel-close"
    >
      <svg aria-hidden="true">...</svg>
    </button>
  </div>
</div>
```

Future locators:

```ts
page.getByTestId('objects-details-side-panel')
page.getByRole('button', { name: 'Close object details' })
```

---

# Problem 6: Inputs In Complex Panels Are Missing Labels

Sales Actions side-panel evidence:

- 26 form controls missing a visible label or accessible name
- 26 `label` axe violation nodes

Problem:

- Playwright cannot prefer `getByLabel()`
- users of assistive technology do not receive the field purpose
- tests fall back to DOM position or nearby text

Recommended additive pattern. Keep the existing `type` unless the frontend intentionally changes the control behavior.

```html
<label id="appointment-date-label" for="appointment-date-input">Appointment date</label>
<input
  id="appointment-date-input"
  name="appointmentDate"
  aria-labelledby="appointment-date-label"
  data-testid="sales-actions-appointment-date-input"
>
```

Future locator:

```ts
page.getByLabel('Appointment date')
```

---

# Problem 7: Tables And Rows Need Stable Contracts

Current locator pattern:

```ts
page.locator('table, [role="table"], [class*="Table"]').first()
```

Current problem:

- table class names are generated or implementation-specific
- repeated rows are difficult to target safely
- row action selection often becomes `.last()`

Recommended additive pattern:

```html
<table class="MqHtbkdfMGAlebPCVeVf" data-testid="objects-table">
  <tbody>
    <tr data-testid="objects-row" data-object-id="<stable-id>">
      ...
    </tr>
  </tbody>
</table>
```

Future locators:

```ts
page.getByTestId('objects-table')
page.locator('[data-testid="objects-row"][data-object-id="<stable-id>"]')
```

---

# Problem 8: Modals And Empty Close Buttons

Current locator pattern:

```ts
dialog(page).locator('button').filter({ hasText: /^$/ }).first()
```

Problem:

- empty buttons are not self-describing
- multiple empty icon buttons can exist inside the same dialog
- automation depends on order, not purpose

Recommended additive pattern:

```html
<div role="dialog" aria-modal="true" aria-labelledby="create-user-title" data-testid="create-user-dialog">
  <h2 id="create-user-title">Create user</h2>
  <button type="button" aria-label="Close dialog" data-testid="create-user-dialog-close">
    <svg aria-hidden="true">...</svg>
  </button>
</div>
```

Future locator:

```ts
page.getByRole('button', { name: 'Close dialog' })
```

---

# Problem 9: File Uploaders Are Class Or Input-Type Fallbacks

Current locator pattern:

```ts
page.locator('[class*="FileUploader"], input[type="file"]').first()
```

Problem:

- the wrapper class is not stable
- `input[type="file"]` is too generic if more uploaders are added
- import and document upload flows need a durable contract

Recommended additive pattern:

```html
<div class="generated-file-uploader-class" data-testid="imports-file-uploader">
  <input
    type="file"
    aria-label="Upload import file"
    data-testid="imports-file-input"
  >
</div>
```

Future locator:

```ts
page.getByTestId('imports-file-input')
```

---

# Problem 10: Toast And Loading Regions Are Not Reliable Status Contracts

Current locator pattern:

```ts
page.locator('[class*="Toast"], [role="alert"], [role="status"]').first()
page.locator('[class*="Loading"], [class*="Placeholder"]').first()
```

Recommended additive patterns:

```html
<div role="status" aria-live="polite" data-testid="app-toast">
  Object updated successfully
</div>

<section aria-busy="true" data-testid="objects-results-section">
  ...
</section>
```

Use `role="alert"` for important error messages. Use `role="status"` for non-urgent success/information messages.

---

# Highest Priority Additive Changes

1. Icon-only buttons and row-action buttons
   - add `aria-label`, `data-testid`, icon `aria-hidden="true"`
2. Filter dropdown triggers
   - add `aria-haspopup`, `aria-expanded`, `aria-controls`, `data-testid`, `data-filter-name`
3. Dropdown options
   - add shared `data-testid`, `data-option-value`, and verified `aria-selected` or `aria-checked`
4. Tables and rows
   - add table/row `data-testid` and stable business identifiers such as `data-object-id`
5. Side panels, dialogs, and close buttons
   - add wrapper identity and accessible close button names
6. Search fields and complex form inputs
   - add label/name/test-id contracts where labels are missing or hard to scope

---

# What We Are Not Asking Frontend To Do

Do not remove existing attributes.

Do not rename existing GUCCI-generated classes.

Do not replace the component library just for automation.

Do not add random ARIA everywhere.

Do add the smallest useful set of attributes to the final rendered nodes that Playwright and accessibility tools actually interact with.

---

# Third-Party Pass-through Checklist

For each GUCCI/third-party component, verify that attributes reach the final DOM node:

- button/icon-button attributes reach the final clickable button-like node
- dropdown trigger attributes reach the final trigger
- dropdown option attributes reach every repeated option node
- input attributes reach the final `input`, `textarea`, `select`, or file input
- table/row attributes reach the table and row nodes used by Playwright
- side-panel/modal attributes reach the visible wrapper and close button
- decorative SVG/icon nodes can receive `aria-hidden="true"`

---

# Target Future Locator Strategy

Preferred order:

1. `getByRole()` when the element has a stable accessible name
2. `getByLabel()` for form fields
3. `getByText()` only when the visible text is stable and unique
4. `getByTestId()` for repeated, translated, dynamic, icon-only, or hard-to-scope controls
5. short stable `data-*` attribute selectors for repeated rows/options

Avoid new selectors based on generated classes, `.first()`, `.last()`, long DOM paths, or XPath.

---

# Meeting Summary

The current D2D DOM has many interactable elements, but the automation contract is incomplete.

The main issue is not that classes exist. The issue is that generated classes are currently forced to act as the locator contract because stable identity, state, relationship, and accessible-name attributes are missing.

The proposed fix is additive:

- keep the current DOM behavior and visual output
- keep existing GUCCI/generated classes
- add targeted attributes to buttons, filters, options, rows, panels, dialogs, uploaders, and status regions
- migrate Playwright gradually from class/order fallbacks to stable role, label, test id, and `data-*` locators
