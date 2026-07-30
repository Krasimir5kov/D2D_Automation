# D2D Frontend — QA Automation Attribute Work
## Full Technical Summary (POSS-3402 to POSS-3422)

---

## Project Context

**Repository:** `microfrontend-door2door-main`  
**Tech stack:** React, TypeScript, Playwright, GuCCI (`@a1/gucci-common-ui-react`)  
**Goal:** Add stable HTML identifiers (`id`, `aria-label`, `data-*` attributes) to interactive UI elements across the D2D frontend so Playwright automation can locate them reliably.

---

## Core Rules (Applied to Every Ticket)

1. **No shared component modification** — Never add `id` props to shared or GuCCI library components. Always use a wrapper div outside the component instance.
2. **English only** — All ID constants, file names, variable names, and `aria-label` values must be in English. No German words in `testIds/` files.
3. **No functional changes** — Purely additive. No logic, state, API calls, routing, or CSS changes.
4. **One branch per ticket** — Each POSS ticket is isolated on its own git branch.
5. **No `display: contents` on wrapper divs** — Breaks CSS sibling selectors. Use `style={{ display: 'inline' }}` for inline contexts.
6. **User manually commits/pushes** — Never run `git add`, `git commit`, or `git push` autonomously.

---

## Wrapper Div Pattern

Used when the target element is a GuCCI or shared component that cannot be given an `id` prop directly:

```tsx
<div id={IDS.someButton} aria-label="Description" style={{ display: 'inline' }}>
  <GucciLinkButton label="..." onClick={...} />
</div>
```

**Exception inside `<NavLink>` (renders as `<a>`):** A block `<div>` inside an anchor is invalid HTML. Use `<span>` instead:

```tsx
<span id={IDS.someButton} style={{ display: 'inline' }}>
  <CancelIconButton />
</span>
```

---

## `testIds/` Folder Structure

All ID constants live in `src/frontend/shared/testIds/`.

| File | What it covers |
|---|---|
| `quickFilter.ids.ts` | Quick filter pill IDs (auto-generated, shared across all pages) |
| `baulose.ids.ts` | Baulose-specific table row IDs |
| `objectList.ids.ts` | Object list table row IDs and context menu options |
| `objectPanel.ids.ts` | Object side panel element IDs |
| `salesAction.ids.ts` | Sales Action list table row IDs, context menu options, pagination |
| `salesActionPanel.ids.ts` | SA side panel IDs + status chip aria-label helpers |
| `configurationInteractionOutcomeList.ids.ts` | Abschlussgründe list, sidebar, nav tabs, create modal |
| `configurationSalesActionTaskList.ids.ts` | Aufgaben list rows + create modal |
| `configurationRegimeList.ids.ts` | Regime list rows + context menu button |
| `configurationRegimeListCreate.ids.ts` | Regime create button + modal |
| `configurationActivitySetupList.ids.ts` | Aktivitäten Setup list rows + context menu + create button |
| `index.ts` | Barrel re-exports (for new consumers only) |
| `usePanelIds.ts` | Hook — derives panel ID set from URL path |

---

## `usePanelIds()` Hook

Located at `src/frontend/shared/testIds/usePanelIds.ts`.

Reads `useLocation().pathname` + `useParams().id` and returns the correct `OBJECT_PANEL_IDS` or `SALES_ACTION_PANEL_IDS` set based on which object type is open:
- pathname includes `/neubau/` → `OBJECT_PANEL_IDS.neubau`
- pathname includes `/ftth/` → `OBJECT_PANEL_IDS.ftth`
- pathname includes `/bestandsbau/` → `OBJECT_PANEL_IDS.bestandsbau`

Works for both Object panel and Sales Action panel since both route paths contain the object type segment.

---

## `rowAttributes` Pattern

`RowObject` type supports:
```ts
rowAttributes?: React.HTMLAttributes<HTMLTableRowElement> & {
  [key: `data-${string}`]: string | undefined
}
```

These are spread onto `<tr>` in `TableEntry.tsx`. Usage:

```tsx
rowAttributes: {
  id: IDS.tableRow(entity.id),
  'data-entity-id': String(entity.id),
  'data-display-name': entity.name ?? '',
  'data-object-type': entity.type ?? ''
}
```

---

## Status Chip Pattern

For chips that display a status value, use `role="status"` + English `aria-label`:

```tsx
<div role="status" aria-label={getSalesActionStatusAriaLabel(status, positiveOutcome)}>
  <TagContainer><Tag ... /></TagContainer>
</div>
```

Status aria-label mapping (from `salesActionPanel.ids.ts`):

| Status | `aria-label` |
|---|---|
| OPEN | `open` |
| IN_PROGRESS | `in progress` |
| CLOSED (positive) | `closed - positive` |
| CLOSED (negative/null) | `closed - negative` |
| CARRIED_OUT | `completed` |
| NOT_EXECUTABLE | `not feasible` |

---

---

# POSS-3402 — Baulose + Sales Actions List View

**Branch:** POSS-3402  
**Scope:** List table rows for all six Baulose table variants + Sales Actions list

### Infrastructure created
- `src/frontend/shared/testIds/` folder (new)
- `baulose.ids.ts`, `objectList.ids.ts`, `objectPanel.ids.ts`, `quickFilter.ids.ts`, `salesAction.ids.ts`, `index.ts`

### Files modified
- `src/frontend/shared/components/Table/TableEntry/TableEntry.tsx` — added `{...row.rowAttributes}` spread on `<tr>`
- `src/frontend/shared/helpers/typeGuards.ts` — fixed `isTableData` guard
- Six Baulose table components — added `rowAttributes` with `id`, `data-*` per row
- `SalesActionsTable.tsx` — added `rowAttributes` with `id`, `data-*` per row

### Key fix: `isTableData` guard
Changed from:
```ts
return !!typecastedEntry?.content;
```
To:
```ts
return typeof typecastedEntry === 'object' && typecastedEntry !== null && 'content' in typecastedEntry;
```
**Why:** `TableData.content` can be `0` or `null` — falsy but valid. The old check would silently drop `cellAttributes` wiring for those rows.

### `quickFilter.ids.ts` pattern
```ts
export const QUICK_FILTER_IDS = {
  container: (filterId: string): string => `quick-filter-${filterId}`,
  pill: (filterId: string, choiceId: string): string => `quick-filter-${filterId}-${choiceId}`,
  clearAllFiltersButton: 'clear-all-applied-filters-button'
} as const;
```
`QuickFilter.tsx` already has `aria-pressed={selected}` on each pill. Auto-generated IDs for Neubau/FTTH/Bestandsbau filters: `quick-filter-objectType-NEUBAU`, `quick-filter-objectType-FTTH`, `quick-filter-objectType-BESTANDSBAU`.

---

# POSS-3403 — Object Side Panel

**Branch:** POSS-3403  
**Scope:** All interactive elements inside the Object detail panel

### Files created
- `src/frontend/shared/testIds/objectPanel.ids.ts`
- `src/frontend/shared/testIds/usePanelIds.ts` (replaced initial `PanelTestIdContext.ts`)

### Key architecture decision
**Initial approach (rejected by reviewer):** `React.createContext` — `PanelTestIdContext`  
**Final approach:** `usePanelIds()` hook reading `useLocation().pathname` — simpler, no re-renders

### Elements covered
- Panel wrapper
- Close button
- Note actions: add, edit, delete, cancel, save

---

# POSS-3404 — Sales Action Side Panel

**Branch:** POSS-3404  
**Scope:** All interactive elements inside the Sales Action detail panel

### Files created
- `src/frontend/shared/testIds/salesActionPanel.ids.ts`

### Files modified (11+ components)
- Action buttons, edit icons, hint buttons
- Customer interaction accordion
- Document row items
- Status chip (`SalesActionStatusTag`)

### Key pattern: status chip
`getSalesActionStatusAriaLabel(status, positiveOutcome)` helper in `salesActionPanel.ids.ts` maps enum values to English aria-labels.

### Key constraint discovered
GuCCI `AccordionItem` — can add `data-testid` directly (it forwards to DOM), but must preserve existing `id` because the accordion uses it for open/closed state tracking internally.

GuCCI `FileUploaderAttachmentItem` — internal delete button cannot be given an attribute without replacing it visually via `contextMenu` prop. Decision: use row-level wrapper ID for Playwright scope. Don't replace the internal button.

---

# POSS-3416 — Abschlussgründe List View

**Branch:** POSS-3416  
**Scope:** Sidebar, table rows, context menu, detail panel, navigation tabs

### Files created
- `src/frontend/shared/testIds/configurationInteractionOutcomeList.ids.ts`

```ts
export const INTERACTION_OUTCOME_IDS = {
  sidebar: 'interaction-outcome-sidebar',
  tableRow: (outcomeId: number | string): string => `interaction-outcome-row-${outcomeId}`,
  contextMenuButton: (outcomeId: number | string): string => `interaction-outcome-${outcomeId}-context-menu-button`,
  childItem: (outcomeId: number | string): string => `interaction-outcome-child-${outcomeId}`,
  childCloseButton: (outcomeId: number | string): string => `interaction-outcome-child-${outcomeId}-close-button`,
  navChildItem: (outcomeId: number | string): string => `interaction-outcome-nav-child-${outcomeId}`,
  navChildCloseButton: (outcomeId: number | string): string => `interaction-outcome-nav-child-${outcomeId}-close-button`
} as const;

export const CONFIGURATION_NAV_IDS = {
  sidebar: 'configuration-navigation-sidebar'
} as const;

export const INTERACTION_OUTCOME_SIDEBAR_STATE = {
  open: 'open',
  closed: 'closed'
} as const;
```

### Files modified
- `InteractionOutcome.tsx` — sidebar wrapper with `id`, `aria-label`, `data-sidebar-state`
- `InteractionOutcomeTable.tsx` — `rowAttributes` with id, data-outcome-id, data-display-name
- `InteractionOutcomeContextMenu.tsx` — context menu button wrapper with id, aria-label
- `VerticalNavigationTabs.tsx` — nav sidebar wrapper with `id`, `aria-label`, `data-nav-items`; each selected tab with id/data-outcome-id/data-display-name; close buttons as `<span>` wrappers (must be `<span>` not `<div>` — inside `<NavLink>` which renders as `<a>`)
- `InteractionOutcomeDetail.tsx` — detail panel with `id`, `data-outcome-id`, `data-display-name`; close button wrapper

### `data-nav-items` pattern
```tsx
data-nav-items={routesConfig
  .filter(({ shouldShow }) => shouldShow)
  .map(({ title }) => title)
  .join(',')}
```
Allows Playwright to assert which tabs are currently open by reading the comma-separated list.

### `data-sidebar-state` pattern
```tsx
data-sidebar-state={
  selectedInteractionOutcomeItems.length > 0
    ? INTERACTION_OUTCOME_SIDEBAR_STATE.open
    : INTERACTION_OUTCOME_SIDEBAR_STATE.closed
}
```

---

# POSS-3417 — Abschlussgründe Create Modal

**Branch:** POSS-3417  
**Scope:** Create button and modal

### Constants added to `configurationInteractionOutcomeList.ids.ts`
```ts
export const INTERACTION_OUTCOME_LIST_CREATE_IDS = {
  button: 'create-interaction-outcome-button',
  modal: 'create-interaction-outcome-modal',
  cancelButton: 'create-interaction-outcome-cancel-button',
  confirmButton: 'create-interaction-outcome-confirm-button'
} as const;
```

### Files modified
- `InteractionOutcome.tsx` — wrapper div around `GucciLinkButton`
- `CreateInteractionOutcomeContentModal.tsx` — outer wrapper div with modal id + aria attributes; `id` prop on cancel and confirm `Button` components

### Decision: modal close button (X) skipped
The X button lives inside `ModalFormWrapper` (shared component). Modifying it would affect every modal in the app. Decision: skip — Playwright can locate it via the parent modal `id` plus `role="button"`.

---

# POSS-3418 — Aufgaben Setup List View + Create Modal

**Branch:** POSS-3418  
**Scope:** Task table rows, create button, create modal

### Files created
- `src/frontend/shared/testIds/configurationSalesActionTaskList.ids.ts`

```ts
export const SALES_ACTION_TASK_IDS = {
  tableRow: (taskId: number | string): string => `task-row-${taskId}`
} as const;

export const SALES_ACTION_TASK_CREATE_IDS = {
  button: 'create-task-button',
  modal: 'create-task-modal',
  cancelButton: 'create-task-cancel-button',
  confirmButton: 'create-task-confirm-button'
} as const;
```

### Files modified
- `SalesActionTasksTable.tsx` — `rowAttributes` with id, data-task-id, data-task-type, data-display-name
- `SalesActionTask.tsx` — wrapper div around `GucciLinkButton`
- `CreateSaTaskContentModal.tsx` — outer wrapper div + cancel/confirm button ids

---

# POSS-3419 — Regime List View

**Branch:** POSS-3419  
**Scope:** Regime table rows + context menu button

### Files created
- `src/frontend/shared/testIds/configurationRegimeList.ids.ts`

```ts
export const REGIME_IDS = {
  tableRow: (regimeId: number | string): string => `regime-row-${regimeId}`,
  contextMenuButton: (regimeId: number | string): string => `regime-${regimeId}-context-menu-button`
} as const;
```

### Files modified
- `RegimesTable.tsx` — `rowAttributes` with id, data-regime-id, data-object-type, data-regime, data-display-name, data-sub-type, data-created-at; `RegimeContextMenu` updated to accept `regimeId` and `regimeName` props; context menu button wrapper with id + aria-label

### `rowAttributes` on Regime rows
```ts
rowAttributes: {
  id: REGIME_IDS.tableRow(regime.id),
  'data-regime-id': String(regime.id),
  'data-object-type': regime.typeName ?? '',
  'data-regime': regime.subTypeName ?? '',
  'data-display-name': regime.subTypeName ?? '',
  'data-sub-type': regime.subType ?? '',
  'data-created-at': formatDate(regime.createdTimestamp) ?? ''
}
```

---

# POSS-3420 — Regime Create Button + Modal

**Branch:** POSS-3420  
**Scope:** Create button and create modal

### Files created
- `src/frontend/shared/testIds/configurationRegimeListCreate.ids.ts`

```ts
export const REGIME_LIST_CREATE_IDS = {
  button: 'create-regime-button',
  modal: 'create-regime-modal',
  cancelButton: 'create-regime-cancel-button',
  confirmButton: 'create-regime-confirm-button'
} as const;
```

### Files modified
- `Regime.tsx` — wrapper div around `GucciLinkButton`
- `CreateRegimeModalContent.tsx` — outer wrapper div + cancel/confirm button ids

### Decision: quick filters already covered
Regime quick filters (Neubau, FTTH-Ausbau, Bestandsbau) are rendered via the shared `QuickFilterMultipleChoice` component which already uses `QUICK_FILTER_IDS.pill()` generating stable ids. `aria-pressed` is already in `QuickFilter.tsx`. No additional work needed.

---

# POSS-3421 — Aktivitäten Setup List View

**Branch:** POSS-3421  
**Scope:** Activity setup table rows + context menu button

### Files created
- `src/frontend/shared/testIds/configurationActivitySetupList.ids.ts`

```ts
export const ACTIVITY_SETUP_IDS = {
  tableRow: (setupId: number | string): string => `activity-setup-row-${setupId}`,
  contextMenuButton: (setupId: number | string): string => `activity-setup-${setupId}-context-menu-button`
} as const;
```

### Files modified
- `InteractionSectionTable.tsx` — `rowAttributes` with id, data-activity-setup-id, data-object-type, data-regime, data-task; `id` and `aria-label` added directly to the inline context menu `<div>` (no separate component — plain div wrapping `MenuBarPointsIconButton`)

### `rowAttributes` on Aktivitäten Setup rows
```ts
rowAttributes: {
  id: ACTIVITY_SETUP_IDS.tableRow(is.id),
  'data-activity-setup-id': String(is.id),
  'data-object-type': is.objectType ?? '',
  'data-regime': is.objectSubtype ?? '',
  'data-task': is.taskName ?? ''
}
```

---

# POSS-3422 — Aktivitäten Setup Create Button

**Branch:** POSS-3422  
**Scope:** Create button wrapper

### Constants added to `configurationActivitySetupList.ids.ts`
```ts
export const ACTIVITY_SETUP_CREATE_IDS = {
  button: 'create-activity-setup-button'
} as const;
```

### Files modified
- `InteractionSection.tsx` — wrapper div around `GucciLinkButton`

### Deferred items
- **Create modal** — does not exist in the codebase yet (`onClick={() => {}}` is a no-op)
- **File uploader** — no import/upload feature exists for this page yet
- **Quick filter specific IDs** — the task requested `activity-setup-filter-neubau` etc., but getting page-specific IDs on shared filter pills would require modifying `QuickFilterMultipleChoice` (shared component). The existing auto-generated IDs (`quick-filter-objectType-NEUBAU` etc.) already provide stable locators and `aria-pressed` is already present.

---

## Known Issues

### `InteractionOutcome.tsx` formatting contamination
**Root cause:** `main` branch has a malformed import with a space before the comma:
```ts
import { INTERACTION_OUTCOME_LIST_CREATE_IDS ,  // malformed
  INTERACTION_OUTCOME_IDS,
  ...
}
```
`npm run format` corrects this on every branch, making the file appear as modified in every PR.  
**Fix needed:** A dedicated PR to `main` that runs `npm run format` on this file and merges the correction.  
**Workaround until then:** Let `npm run format` correct it and commit it alongside the task changes — it is a pure formatting fix with no logic impact.

---

## Playwright Selector Reference

### Row selectors
```ts
// Any row by entity id
page.locator('#interaction-outcome-row-42')
page.locator('#task-row-17')
page.locator('#regime-row-5')
page.locator('#activity-setup-row-3')

// Row by data attribute
page.locator('[data-display-name="Mein Abschlussgrund"]')
page.locator('[data-object-type="NEUBAU"]')
```

### Context menu buttons
```ts
page.locator('#interaction-outcome-42-context-menu-button')
page.locator('#regime-5-context-menu-button')
page.locator('#activity-setup-3-context-menu-button')
```

### Create buttons
```ts
page.locator('#create-interaction-outcome-button')
page.locator('#create-task-button')
page.locator('#create-regime-button')
page.locator('#create-activity-setup-button')
```

### Modals and their footer buttons
```ts
// Scope all assertions inside the open modal
const modal = page.locator('#create-interaction-outcome-modal')
await modal.locator('#create-interaction-outcome-cancel-button').click()
await modal.locator('#create-interaction-outcome-confirm-button').click()
```

### Sidebar state
```ts
// Check if Abschlussgründe sidebar is open
page.locator('#interaction-outcome-sidebar[data-sidebar-state="open"]')

// Configuration nav sidebar — check visible tabs
page.locator('#configuration-navigation-sidebar[data-nav-items*="Mein Tab"]')
```

### Quick filters (auto-generated, all pages)
```ts
page.locator('#quick-filter-objectType-NEUBAU')          // Neubau pill
page.locator('#quick-filter-objectType-FTTH')             // FTTH-Ausbau pill
page.locator('#quick-filter-objectType-BESTANDSBAU')      // Bestandsbau pill

// Assert selected state
page.locator('#quick-filter-objectType-NEUBAU[aria-pressed="true"]')
```

### Status chip (Sales Action panel)
```ts
page.locator('[role="status"][aria-label="closed - positive"]')
page.locator('[role="status"][aria-label="in progress"]')
```
