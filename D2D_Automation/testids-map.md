# D2D Stable Test IDs — Playwright Selector Reference

All IDs and attributes added by POSS-3402 → POSS-3422.
Use these in page objects and specs instead of text/CSS selectors.

---

## Quick filters (all list pages — auto-generated)

```ts
// Pills
'#quick-filter-objectType-NEUBAU'
'#quick-filter-objectType-FTTH'
'#quick-filter-objectType-BESTANDSBAU'

// Assert selected state
page.locator('#quick-filter-objectType-NEUBAU[aria-pressed="true"]')
page.locator('#quick-filter-objectType-FTTH[aria-pressed="false"]')

// Clear all filters
'#clear-all-applied-filters-button'
```

---

## Baulose list (POSS-3402)

```ts
// Table rows — rowAttributes spread on <tr>
// id pattern:   baulose-row-{entityId}
// data attrs:   data-entity-id, data-display-name, data-object-type

page.locator('#baulose-row-42')
page.locator('[data-object-type="NEUBAU"]')
page.locator('[data-display-name="My Baulose Name"]')
```

---

## Object list (POSS-3402)

```ts
// Table rows
// id pattern:   object-row-{entityId}
// data attrs:   data-entity-id, data-display-name, data-object-type

page.locator('#object-row-17')
page.locator('[data-object-type="FTTH"]')
```

---

## Object side panel (POSS-3403)

```ts
// Panel wrapper — testId used by SidePanel component
'object-panel-neubau'       // getByTestId
'object-panel-ftth'
'object-panel-bestandsbau'

// Close button
page.locator('#object-panel-neubau-close-button')

// Notes actions
page.locator('#object-panel-add-note-button')
page.locator('#object-panel-edit-note-button')
page.locator('#object-panel-delete-note-button')
page.locator('#object-panel-cancel-note-button')
page.locator('#object-panel-save-note-button')
```

Use `usePanelIds()` hook on the frontend — reads `useLocation().pathname` to return the correct panel ID set:
- `/neubau/` → `OBJECT_PANEL_IDS.neubau`
- `/ftth/` → `OBJECT_PANEL_IDS.ftth`
- `/bestandsbau/` → `OBJECT_PANEL_IDS.bestandsbau`

---

## Sales Action list (POSS-3402)

```ts
// Table rows
// id pattern:   sales-action-row-{entityId}
// data attrs:   data-entity-id, data-display-name, data-object-type

page.locator('#sales-action-row-99')
page.locator('[data-object-type="BESTANDSBAU"]')
```

---

## Sales Action side panel (POSS-3404)

```ts
// Status chip
page.locator('[role="status"][aria-label="open"]')
page.locator('[role="status"][aria-label="in progress"]')
page.locator('[role="status"][aria-label="closed - positive"]')
page.locator('[role="status"][aria-label="closed - negative"]')
page.locator('[role="status"][aria-label="completed"]')
page.locator('[role="status"][aria-label="not feasible"]')

// AccordionItem — data-testid forwarded to DOM (preserve existing id for open/closed state)
// FileUploaderAttachmentItem — use row-level wrapper id to scope, internal delete button not accessible
```

---

## Konfiguration — Abschlussgründe (POSS-3416)

```ts
// Sidebar
page.locator('#interaction-outcome-sidebar')
page.locator('#interaction-outcome-sidebar[data-sidebar-state="open"]')
page.locator('#interaction-outcome-sidebar[data-sidebar-state="closed"]')

// Table rows
page.locator('#interaction-outcome-row-42')
page.locator('[data-outcome-id="42"]')
page.locator('[data-display-name="Mein Abschlussgrund"]')

// Context menu button
page.locator('#interaction-outcome-42-context-menu-button')

// Child items in nav sidebar
page.locator('#interaction-outcome-child-42')
page.locator('#interaction-outcome-child-42-close-button')
page.locator('#interaction-outcome-nav-child-42')
page.locator('#interaction-outcome-nav-child-42-close-button')

// Config navigation sidebar
page.locator('#configuration-navigation-sidebar')
page.locator('#configuration-navigation-sidebar[data-nav-items*="My Tab"]')

// data-nav-items is a comma-separated list of visible tab titles
```

---

## Konfiguration — Abschlussgründe Create Modal (POSS-3417)

```ts
page.locator('#create-interaction-outcome-button')

const modal = page.locator('#create-interaction-outcome-modal')
await modal.locator('#create-interaction-outcome-cancel-button').click()
await modal.locator('#create-interaction-outcome-confirm-button').click()
```

---

## Konfiguration — Aufgaben (POSS-3418)

```ts
// Table rows
page.locator('#task-row-17')
page.locator('[data-task-id="17"]')
page.locator('[data-task-type="..."]')
page.locator('[data-display-name="Task Name"]')

// Create
page.locator('#create-task-button')

const modal = page.locator('#create-task-modal')
await modal.locator('#create-task-cancel-button').click()
await modal.locator('#create-task-confirm-button').click()
```

---

## Konfiguration — Regime (POSS-3419)

```ts
// Table rows
page.locator('#regime-row-5')
page.locator('[data-regime-id="5"]')
page.locator('[data-object-type="NEUBAU"]')
page.locator('[data-regime="Sub Type Name"]')
page.locator('[data-display-name="Sub Type Name"]')
page.locator('[data-sub-type="..."]')
page.locator('[data-created-at="01.01.2024"]')

// Context menu
page.locator('#regime-5-context-menu-button')
```

---

## Konfiguration — Regime Create Modal (POSS-3420)

```ts
page.locator('#create-regime-button')

const modal = page.locator('#create-regime-modal')
await modal.locator('#create-regime-cancel-button').click()
await modal.locator('#create-regime-confirm-button').click()
```

Note: Regime quick filters use the shared `QUICK_FILTER_IDS` — same `#quick-filter-objectType-*` IDs, no separate regime-specific filter IDs needed.

---

## Konfiguration — Aktivitäten Setup (POSS-3421)

```ts
// Table rows
page.locator('#activity-setup-row-3')
page.locator('[data-activity-setup-id="3"]')
page.locator('[data-object-type="NEUBAU"]')
page.locator('[data-regime="Sub Type"]')
page.locator('[data-task="Task Name"]')

// Context menu
page.locator('#activity-setup-3-context-menu-button')
```

---

## Konfiguration — Aktivitäten Setup Create (POSS-3422)

```ts
page.locator('#create-activity-setup-button')

// Create modal does not exist yet (onClick is a no-op as of POSS-3422)
// File uploader not implemented yet
```

---

## Scoping pattern — always scope inside modal

```ts
// ✅ CORRECT — assertion is scoped inside the modal element
const modal = page.locator('#create-regime-modal')
await expect(modal).toBeVisible()
await modal.locator('#create-regime-confirm-button').click()

// ❌ AVOID — page-wide locator may match wrong element if multiple modals exist
await page.locator('#create-regime-confirm-button').click()
```

---

## Known gaps (IDs not yet added to frontend)

| Element | Status |
|---|---|
| Aktivitäten Setup create modal | Not implemented yet (onClick no-op) |
| Aktivitäten Setup file uploader | Not implemented yet |
| Modal close button (X) | Skipped — lives in shared `ModalFormWrapper`, use `Escape` key |
| Benutzerverwaltung search field | No stable ID yet — use `input[placeholder*="Suche"]` fallback |
| Importe search field | No stable ID yet — use `getByPlaceholder(/Suche in Importe/i)` |
