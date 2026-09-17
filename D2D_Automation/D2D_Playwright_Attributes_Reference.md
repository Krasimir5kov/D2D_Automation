# D2D Frontend — Playwright Attributes Reference

## Sourced entirely from real commits, not secondhand summaries

Every claim in this document cites the commit hash(es) it was verified against. All 27 non-duplicate commits
across POSS-3397–3422 were read in full (`git show <hash> -- '*.ts' '*.tsx'`), plus the current state of every
file in `src/frontend/shared/testIds/` on `main` (tip `576630b2` at time of writing). Where something could not
be verified from these commits, it is marked **UNVERIFIED** rather than guessed.

Consolidated 2026-09-16, replacing three previously-overlapping docs (`D2D_QA_Attributes_Work_Summary.md`,
`testids-map.md`) which had already been caught disagreeing with each other and with the live app — see git
history / `CLAUDE.md` for how this consolidation was done and what it found. Re-verify against a fresh
`git show`/current `testIds/` files if this doc's information is ever suspected stale, rather than trusting it
blindly forever — it's a point-in-time snapshot of real commits, not a live source.

---

## How to read this file

- `{id}` = a dynamic DB id (number or string) interpolated into the pattern.
- Every row states the **actual attribute name** (`id`, `data-testid`, `data-*`, `aria-label`, `aria-pressed`,
  `role`) — do not assume everything is `id`. Two real bugs in the old docs came from assuming that.
- `(commit)` after a row is the commit hash that added or last touched that exact attribute.
- ⚠️ marks something that is easy to get wrong (verified counter-intuitive behavior), 💀 marks a dead constant
  that exists in the `.ids.ts` file but is **never applied to any DOM element** — don't write a test against it.
- Import paths shown are the real paths under `src/frontend/shared/testIds/`. **`index.ts` does not re-export
  everything** — several newer files (`configuration*.ids.ts`, `imports.ids.ts`, `organizationSidePanel.ids.ts`,
  `organizations.ids.ts`, `salesActionPanel.ids.ts` partially, `teamSidePanel.ids.ts`, `teams.ids.ts` partially,
  `userAdministration.ids.ts` partially, `userSidePanel.ids.ts`) are **not** in the barrel — import them by
  their own file path, not from `shared/testIds`.

---

## 0. Shared mechanics you need to understand before writing any locator

### 0.1 Table rows: `rowAttributes` overrides the default `tr-{id}`
`Table.tsx` renders every row as `<TableEntry id={\`tr-${rowObj.id}\`} rowAttributes={rowObj.rowAttributes} .../>`
(this `tr-` prefixing predates this initiative and was never touched by it — confirmed on current `main`).
`TableEntry.tsx` does:
```tsx
<tr ref={ref} id={id} {...rowAttributes} className={...}>
```
Because `{...rowAttributes}` is spread **after** `id={id}`, any table whose row object sets
`rowAttributes: { id: SOME_IDS.tableRow(x), ... }` gets that clean id on the real `<tr>`, overriding `tr-{...}`.
**Baulose is the one exception** — its tables never set `rowAttributes` at all (verified: zero `rowAttributes`
occurrences across every Baulose-touching commit), so its rows keep the raw `tr-{id}-{ftthId}` id. See §2.

Every other list table covered below (Objects, Sales Actions, Users, Teams, Organizations, Imports,
Abschlussgründe, Aufgaben, Regime, Aktivitäten Setup) does set `rowAttributes`, so their documented ids below
are the real, clean `<tr id="...">` values.

### 0.2 `usePanelIds()` — only 4 route segments are covered
`src/frontend/shared/testIds/usePanelIds.ts` (introduced `e2065988`→`77cc702c` as a hook, replacing an earlier
`PanelTestIdContext` React Context that was tried and reverted in the same ticket):
```ts
export const usePanelIds = () => {
  const { pathname } = useLocation();
  const { id } = useParams<{ id?: string }>();
  const ids = pathname.includes('/neubau/') ? OBJECT_PANEL_IDS.neubau
    : pathname.includes('/ftth/') ? OBJECT_PANEL_IDS.ftth
    : pathname.includes('/bestandsbau/') ? OBJECT_PANEL_IDS.bestandsbau
    : pathname.includes('/users/') ? (USER_SIDE_PANEL_STATIC_IDS as unknown as typeof OBJECT_PANEL_IDS.neubau)
    : null;
  return ids ? { ids, objectId: id ? +id : undefined } : null;
};
```
(current `main`; last touched `b61064d4`). It feeds the shared `SidePanel.tsx`, `NoteInfo`/`Note`/`EditMode`,
and `DefaultEditContainer` components. **It does not cover Sales Action, Team, or Organization panel routes** —
those panels set their own ids directly in their own components instead (see §7, §10, §12).

### 0.3 Wrapper-div pattern (never edit a shared/GuCCI component)
Every id on a GuCCI component (`GucciLinkButton`, `Button`, icon buttons, etc.) that isn't a first-class prop is
applied via an outer wrapper, per the project's own rule (confirmed consistently across all 27 commits):
```tsx
<div id={IDS.someButton} aria-label="..." style={{ display: 'inline' }}>
  <GucciLinkButton label="..." onClick={...} />
</div>
```
Inside a React Router `<NavLink>` (renders as `<a>`), a block `<div>` wrapper is invalid HTML — a `<span>` is
used instead (`f7ddeae1`, `VerticalNavigationTabs.tsx`).

---

## 1. Filter bar — shared across (almost) every list page

### 1.1 Quick filter pills — `QuickFilter.tsx` / `QuickFilterMultipleChoice.tsx`
File: `shared/testIds/quickFilter.ids.ts` (barrel-exported). Commits: `94640e07`, `d593b02e`, `de96e3c0`.
```ts
export const QUICK_FILTER_IDS = {
  container: (filterId: string) => `quick-filter-${filterId}`,
  pill: (filterId: string, choiceId: string) => `quick-filter-${filterId}-${choiceId}`,
  clearAllFiltersButton: 'clear-all-applied-filters-button'
} as const;
```
| Element | Attribute | Pattern | Selector example |
|---|---|---|---|
| Filter group wrapper (`QuickFilterMultipleChoice`) | `id` | `quick-filter-{filterId}` | `#quick-filter-objectType` |
| Individual pill (`QuickFilter`) | `id` | `quick-filter-{filterId}-{choiceId}` | `#quick-filter-objectType-NEUBAU` |
| Pill selected state | `aria-pressed` (built into `QuickFilter.tsx`, `de96e3c0`) | `"true"`/`"false"` | `#quick-filter-objectType-NEUBAU[aria-pressed="true"]` |
| "Alle Filter entfernen" (Clear all) | `id` | `clear-all-applied-filters-button` | `#clear-all-applied-filters-button` |

```ts
await page.locator('#quick-filter-objectType-NEUBAU').click();
await expect(page.locator('#quick-filter-objectType-NEUBAU')).toHaveAttribute('aria-pressed', 'true');
```

### 1.2 `FilterDropDownButton` — ⚠️ raw filter-config id, no computed pattern
`shared/components/Filter/FilterDropdown/FilterDropdownButton.tsx`. Commits: `282c9525` (added `id` prop),
`d593b02e` (refactor: dropped the prop entirely and reads `filterConfig.id` directly instead).
```tsx
<Button label={buttonLabel} status={open ? 'open' : 'closed'} handleClick={handleToggle} id={filterConfig.id} />
```
There is **no dedicated `.ids.ts` file** for this. The rendered `id` is whatever string the filter's own config
object (defined in filter-config constants elsewhere, outside this initiative's commits) uses as `id` — e.g. a
filter registered as `objectType` renders `<div id="objectType">`. If you need this selector for a specific
page, find the filter's `id` in that page's filter config, not in a `testIds` file.

### 1.3 `RangeFilterDate` — date-range filter, shared component
`shared/components/Filter/FilterDropdown/RangeFilter/RangeFilterDate/RangeFilterDate.tsx`. Commit: `b1eb1e8a`
(first wired for Imports, but it's a shared component — any page using a date-range filter gets this for free).
```tsx
<div className={styles.Container} id={`${location}-filter-${filterConfig.id}`} aria-label={filterConfig.label}>
```
`location` is the `FilterLocation` the filter is scoped to (e.g. `'imports'`). No dedicated ids file — construct
the selector as `#{location}-filter-{filterConfigId}`.

---

## 2. Baulose — list page

File: `shared/testIds/baulose.ids.ts` (barrel-exported). Commits: `00708325`, `d593b02e`.
```ts
export const BAULOSE_IDS = {
  salesActionsLink: (type, contractSection) =>
    `sales-actions-link-${type.toLowerCase()}-${contractSection.id}-${contractSection.ftthId ?? ''}`,
  pageNavigator: (type) => `page-navigator-${type}`,
  tableRow: (id, ftthId?) => `${id}-${ftthId ?? ''}`
} as const;
```
| Element | Attribute | Real pattern | Selector example |
|---|---|---|---|
| Table row `<tr>` | `id` | ⚠️ **`tr-{id}-{ftthId}`** — see §0.1, this table never sets `rowAttributes` so the `tr-` prefix from `Table.tsx` is never overridden | `#tr-123-` (bare `id`, no `ftthId`) or `#tr-123-ftth456` |
| "zu Sales Actions" link (`BaulosSalesActionsLink`) | `id` (wrapper `div`) | `sales-actions-link-{type}-{contractSectionId}-{ftthId}` | `#sales-actions-link-neubau-10-` |
| Page navigator wrapper | `id` | `page-navigator-{type}` | `#page-navigator-neubau` |

No `data-*` attribute exists on a Baulose row at all — no `data-object-type`, no `data-display-name`, no
`data-object-id`/`data-entity-id`. Filter/select Baulose rows by `id` or by content, not by a data attribute.

---

## 3. Objects — list page (Neubau / FTTH-Ausbau / Bestandsbau)

File: `shared/testIds/objectList.ids.ts` (barrel-exported). Commits: `e5ffc159` (inline strings first), `d593b02e`
(extracted to constants + added `rowAttributes`), `77cc702c` (renamed context-menu-option keys to English).
```ts
export const OBJECT_LIST_IDS = {
  tableRow: (objectId) => `object-row-${objectId}`,
  tableRowNameCell: (objectId) => `object-row-${objectId}-name`,
  tableRowOrganisationCell: (objectId) => `object-row-${objectId}-organisation`,
  tableRowContextMenu: (objectId) => `object-row-${objectId}-context-menu`,
  pageNavigator: (type) => `page-navigator-${type}`,
  contextMenuOption: {
    openDetailView: 'object-context-menu-option-open-detail-view',
    openQuestionnaire: 'object-context-menu-option-open-questionnaire',
    handoverObject: 'object-context-menu-option-handover-object',
    rejectObject: 'object-context-menu-option-reject-object'
  }
};
```
| Element | Attribute | Pattern |
|---|---|---|
| Table row `<tr>` (via `rowAttributes`) | `id` | `object-row-{id}` |
| Row | `data-object-type` | `NEUBAU` / `FTTH` / `BESTANDSBAU` (raw `object.objectType.type`, uppercase) |
| Row | `data-object-name` | `object.title ?? object.wbtmTitle ?? ''` |
| Name cell (`cellAttributes`) | `id` | `object-row-{id}-name` |
| Organisation cell (`cellAttributes`) | `id` | `object-row-{id}-organisation` |
| Context menu button (`ObjectContextMenu`) | `id` | `object-row-{id}-context-menu` |
| Context menu button | `aria-label` | `Open object context menu` |
| Page navigator wrapper | `id` + `aria-label` | `page-navigator-{type}` / `"Objects pagination"` |

```ts
const row = page.locator('#object-row-42');
await row.locator('#object-row-42-context-menu').click();
await page.locator('#object-context-menu-option-open-detail-view').click();
page.locator('tr[data-object-type="NEUBAU"]');
```

---

## 4. Object Side Panel — Neubau / FTTH / Bestandsbau

File: `shared/testIds/objectPanel.ids.ts` (barrel-exported), fed via `usePanelIds()` (§0.2). Commits: `e2065988`
(first pass, several ids later removed — see §4.4), `d593b02e` (centralized + removed 4 ids), `77cc702c`
(hook replaces Context).

### 4.1 Neubau
| Element | Attribute | Value |
|---|---|---|
| Panel wrapper (`SidePanel.tsx` root `div`) | `id` | `neubau-object-side-panel` |
| Panel wrapper | `aria-label` | `Object side panel` |
| Panel wrapper | `data-object-id` | the object's DB id |
| Close button (`<Link>`) | `id` | `neubau-object-side-panel-close-button` |
| "zu Sales Actions" link | `id` | `neubau-object-go-to-sales-actions-button` |
| Sales-start status radio group wrapper | `id` | `neubau-object-status-radio-group` |
| Edit form — cancel | `id` | `neubau-object-edit-cancel-button` |
| Edit form — apply | `id` | `neubau-object-edit-apply-button` |
| Notiz — add | `id` | `neubau-object-note-add-button` |
| Notiz — edit | `id` | `neubau-object-note-edit-button` |
| Notiz — delete | `id` | `neubau-object-note-delete-button` |
| Notiz — cancel | `id` | `neubau-object-note-cancel-button` |
| Notiz — save | `id` | `neubau-object-note-save-button` |
| Notiz — "send to A1" checkbox | `id` | `neubau-object-note-send-to-a1-checkbox` |
| Fragebogen — edit | `id` | `neubau-object-questionnaire-edit-button` |
| Fragebogen — cancel | `id` | `neubau-object-questionnaire-cancel-button` |
| Fragebogen — save | `id` | `neubau-object-questionnaire-save-button` |
| D2D-Verkauf tab, per sales-action row — context menu | `id` | `neubau-door-sales-action-context-menu-button-{salesActionId}` |
| D2D-Verkauf tab, per row — "Zur Detailansicht" | `id` | `neubau-door-sales-action-detail-view-button-{salesActionId}` |
| D2D-Verkauf tab, per row — delete | `id` | `neubau-door-sales-action-delete-button-{salesActionId}` |

### 4.2 FTTH / Bestandsbau
Same shape, `ftth-object-*` / `bestandsbau-object-*` prefix, but **no** status-radio-group, edit-cancel/apply,
questionnaire, or D2D-Verkauf-tab ids — those are Neubau-only:
`{prefix}-object-side-panel`, `{prefix}-object-side-panel-close-button`, `{prefix}-object-go-to-sales-actions-
button`, `{prefix}-object-note-add-button`, `{prefix}-object-note-edit-button`, `{prefix}-object-note-delete-
button`, `{prefix}-object-note-cancel-button`, `{prefix}-object-note-save-button`.

### 4.3 Panel edit-container buttons — actually come from `usePanelIds()`, not local props
`DefaultEditContainer.tsx` and `NoteInfo`/`Note`/`EditMode.tsx` no longer take an `idPrefix` prop (that was the
`e2065988` approach) — they call `usePanelIds()` internally (`77cc702c`) and read `ctx?.ids.noteCancelButton` /
`ctx?.ids.noteSaveButton` / etc. Functionally this produces the same ids listed in §4.1/§4.2 above; just don't
expect to find an `idPrefix` prop if you go reading the component source.

### 4.4 💀 Dead end — 4 ids that existed briefly and are now gone
`e2065988` added `neubau-object-edit-button`, `neubau-object-lkms-toggle` (+`aria-label="Open LKMS
Information"`), `neubau-object-assign-button`, `neubau-object-reject-button`. **All four were removed in the
very next commit** (`d593b02e`) and never came back — confirmed absent from `objectPanel.ids.ts` on current
`main`. If you find these mentioned in an old ticket description or PR comment, they no longer exist. There is
currently **no stable id** for the Neubau "Bearbeiten" (edit) action-bar button, the Lokation section's
collapse/expand toggle, or the assign/reject buttons — locate them by role/label until a new ticket adds one.

---

## 5. Sales Actions — list page (Neubau / FTTH-Ausbau / Bestandsbau)

File: `shared/testIds/salesAction.ids.ts` (barrel-exported). Commits: `d8393bf6` (POSS-3404 — this is the list
view, not the panel — see discrepancy report §2.1 for why one older doc mislabels this), `271a0f49` (English
context-menu-option keys).
```ts
export const SALES_ACTION_IDS = {
  tableRow: (id) => `sales-action-row-${id}`,
  tableRowMainInfo: (id) => `sales-action-row-${id}-main-info`,
  tableRowStatus: (id) => `sales-action-row-${id}-status`,
  tableRowContextMenu: (id) => `sales-action-row-${id}-context-menu`,
  tableRowQuickCreationCustomerInteraction: (id) => `sales-action-row-${id}-quick-creation-customer-interaction`,
  contextMenuButtonAriaLabel: 'Open sales action context menu',
  pagination: 'sales-actions-pagination',
  contextMenuOption: {
    openDetailView: 'sales-action-context-menu-option-open-detail-view',
    recordActivity: 'sales-action-context-menu-option-record-activity',
    recordSketch: 'sales-action-context-menu-option-record-sketch',
    recordOrder: 'sales-action-context-menu-option-record-order',
    customerNotMet: 'sales-action-context-menu-option-customer-not-met',
    notReached: 'sales-action-context-menu-option-not-reached',
    deleteSalesAction: 'sales-action-context-menu-option-delete-sales-action'
  }
} as const;
```
| Element | Attribute | Pattern |
|---|---|---|
| Table row `<tr>` (via `rowAttributes`) | `id` | `sales-action-row-{id}` |
| Row | `data-sales-action-id` | the DB id (string) |
| Row | `data-object-type` | lowercased `salesAction.object.objectType.type` (`neubau` / `ftth-ausbau` / `bestandsbau`) |
| Row | `data-sales-action-type` | `salesAction.salesActionTypeName` |
| Row | `data-regime` | `salesAction.object.objectType.subTypeName` (or `.subType` fallback) |
| Main-info cell (`SalesActionAddress`/`NewBuildingSalesActionAddress`) | `id` | `sales-action-row-{id}-main-info` |
| Main-info cell | `data-sales-action-type`, `data-regime` | same as row |
| Status cell (`SalesActionStatus`) | `id` | `sales-action-row-{id}-status` |
| Status cell | `data-status-value` | `salesAction.status` |
| Context menu button | `id` + `aria-label` | `sales-action-row-{id}-context-menu` / `Open sales action context menu` |
| "Address not exist" quick-creation icon | `id` | `sales-action-row-{id}-quick-creation-customer-interaction` |
| Pagination wrapper | `id` + `aria-label` | `sales-actions-pagination` / `"Sales Actions pagination"` |

Context menu options are static ids (no dynamic part) — one menu instance per row, scope by the row first:
```ts
const row = page.locator('#sales-action-row-55');
await row.locator('#sales-action-row-55-context-menu').click();
await page.locator('#sales-action-context-menu-option-record-activity').click();
```

---

## 6. Sales Action Side Panel

File: `shared/testIds/salesActionPanel.ids.ts` (barrel-exported). Commits: `83c71c52` (POSS-3405 — this is the
panel; see §5 for why the list view is a different ticket), `bd4292b1` (Capture Activity Modal).
```ts
export const SALES_ACTION_PANEL_IDS = {
  editStatusButton: (id) => `sales-action-${id}-edit-status-button`,
  editAssignmentButton: (id) => `sales-action-${id}-edit-assignment-button`,
  noteAddButton: (id) => `sales-action-${id}-note-add-button`,       // 💀 see below
  noteEditButton: (id) => `sales-action-${id}-note-edit-button`,     // 💀 see below
  noteDeleteButton: (id) => `sales-action-${id}-note-delete-button`, // 💀 see below
  hintAddButton: (id) => `sales-action-${id}-hint-add-button`,
  hintEditButton: (id) => `sales-action-${id}-hint-edit-button`,
  hintDeleteButton: (id) => `sales-action-${id}-hint-delete-button`,
  hintCancelButton: (id) => `sales-action-${id}-hint-cancel-button`,
  hintSaveButton: (id) => `sales-action-${id}-hint-save-button`,
  captureActivityButton: (id) => `sales-action-${id}-capture-activity-button`,
  deleteButton: (id) => `sales-action-${id}-delete-button`,
  correctDoorNumberButton: (id) => `sales-action-${id}-correct-door-number-button`,
  planSketchButton: (id) => `sales-action-${id}-plan-sketch-button`,
  captureOrderButton: (id) => `sales-action-${id}-capture-order-button`,
  captureAblegerButton: (id) => `sales-action-${id}-capture-ableger-button`,
  customerInteractionToggle: (id, num) => `sales-action-${id}-customer-interaction-${num}-toggle`, // ⚠️ data-testid, not id
  documentItem: (salesActionId, documentId) => `sales-action-${salesActionId}-document-${documentId}`
} as const;
```
| Element | Attribute | Notes |
|---|---|---|
| Edit status icon button | `id` | wrapper `div` |
| Edit assignment icon button | `id` | wrapper `div` |
| Hint — add/edit/delete/cancel/save | `id` | wrapper `div`/`Button` |
| Capture-activity link | `id` | wrapper `div` |
| Delete link | `id` | wrapper `div` |
| Correct-door-number link | `id` | wrapper `div` (Neubau `BaseInfoAddressNewBuilding` only) |
| Plan-sketch / Capture-order / Capture-Ableger link | `id` | wrapper `div` |
| Customer-interaction accordion item | ⚠️ **`data-testid`**, not `id` | `id` on the same `<AccordionItem>` is a *different* value (`key`) the GuCCI accordion needs internally — do **not** locate by `#sales-action-{id}-customer-interaction-{num}-toggle`, use `getByTestId(...)` |
| Document attachment wrapper | `id` | real `id` this time, wraps `FileUploaderAttachmentItem` |
| 💀 Notiz — add/edit/delete | *(none — dead constants)* | `noteAddButton`/`noteEditButton`/`noteDeleteButton` are defined here but **never applied to any element** in any of the 27 reviewed commits. The Sales Action panel's Notiz UI (if any) is not wired to a stable id. Don't write a locator against these three. |

Status chip (`SalesActionStatusTag`), commit `83c71c52`:
```tsx
<div role="status" aria-label={getSalesActionStatusAriaLabel(status, positiveOutcome)}>
```
| Status | `aria-label` |
|---|---|
| `OPEN` | `open` |
| `IN_PROGRESS` | `in progress` |
| `CLOSED` + `positiveOutcome` true | `closed - positive` |
| `CLOSED` (otherwise) | `closed - negative` |
| `CARRIED_OUT` | `completed` |
| `NOT_EXECUTABLE` | `not feasible` |
| anything else | `no status` |
```ts
await expect(page.locator('[role="status"]')).toHaveAttribute('aria-label', 'closed - positive');
```

### Capture Activity Modal
```ts
export const CAPTURE_ACTIVITY_MODAL_IDS = {
  modal: 'sales-action-activity-modal',
  cancelButton: 'sales-action-activity-cancel-button',
  saveButton: 'sales-action-activity-save-button',
  performedByOption: (userId) => `activity-performed-by-option-${userId}`
} as const;
```
`performedByOption` renders on a `<span id={...} data-user-id={option.value} aria-label={option.label}>` inside
the "durchgeführt von" select's custom option renderer (`bd4292b1`).

---

## 7. User Administration — list page + create actions

File: `shared/testIds/userAdministration.ids.ts` (**not** barrel-exported in full — `USER_ADMINISTRATION_IDS`
is exported from `index.ts`, import it from there or directly). Commits: `7de4cbb8` (list), `de96e3c0`
(create buttons + quick-filter `aria-pressed` + `clearAllFiltersButton`, shared with §1.1).
```ts
export const USER_ADMINISTRATION_IDS = {
  tableRow: (userId) => `user-row-${userId}`,
  tableRowFirstNameCell: (userId) => `user-${userId}-first-name`,
  tableRowLastNameCell: (userId) => `user-${userId}-last-name`,
  tableRowStatusCell: (userId) => `user-${userId}-status`,
  tableRowEmailCell: (userId) => `user-${userId}-email`,
  tableRowOrganizationCell: (userId) => `user-${userId}-organization`,
  tableRowRoleCell: (userId) => `user-${userId}-role`,
  tableRowContextMenuButton: (userId) => `user-${userId}-context-menu-button`,
  contextMenuOption: {
    details: (userId) => `user-${userId}-context-menu-option-details`,
    edit: (userId) => `user-${userId}-context-menu-option-edit`,
    deactivate: (userId) => `user-${userId}-context-menu-option-deactivate`,
    delete: (userId) => `user-${userId}-context-menu-option-delete`,
    activate: (userId) => `user-${userId}-context-menu-option-activate`
  },
  pageNavigator: 'page-navigator-users',
  createUserButton: 'create-user-button',
  createTeamButton: 'create-team-button',
  createAdminA1Button: 'create-admin-a1-button'
} as const;
```
| Element | Attribute | Pattern |
|---|---|---|
| Table row `<tr>` | `id` | `user-row-{id}` |
| Row | `data-user-id`, `aria-label`, `data-user-status` | id string / `"{firstName} {lastName}"` / `active`/`inactive` |
| First/last name, status, email, organization, role cells | `id` | `user-{id}-{cell}` (see constants above) |
| Context menu button | `id` + `aria-label` | `user-{id}-context-menu-button` / `Open actions for {firstName} {lastName}` |
| Page navigator wrapper | `id` | `page-navigator-users` (no `aria-label` on this one) |
| "Benutzer erstellen" | `id` (wrapper) | `create-user-button` |
| "Team erstellen" | `id` (wrapper) | `create-team-button` |
| "Admin A1 erstellen" | `id` (wrapper) | `create-admin-a1-button` |

---

## 8. User Side Panel

File: `shared/testIds/userSidePanel.ids.ts` (not barrel-exported — import directly). Commits: `b61064d4`.
Fed partly via `usePanelIds()` for the shared `SidePanel` wrapper (`USER_SIDE_PANEL_STATIC_IDS`), but all the
per-user dynamic ids below are set directly in `UserPanel.tsx`/`UserPanelDetails.tsx`/`UserPanelEdit.tsx`.
```ts
export const USER_SIDE_PANEL_STATIC_IDS = { wrapper: 'user-side-panel', ariaLabel: 'User side panel', closeButton: 'user-side-panel-close-button' } as const;
export const USER_SIDE_PANEL_STATE = { open: 'open', closed: 'closed' } as const;
export const USER_SIDE_PANEL_IDS = {
  sidePanel: (id) => `user-side-panel-${id}`,
  editButton: (id) => `user-${id}-edit-button`,
  deactivateButton: (id) => `user-${id}-deactivate-button`,
  deleteButton: (id) => `user-${id}-delete-button`,
  activateButton: (id) => `user-${id}-activate-button`,
  editCancelButton: (id) => `user-${id}-edit-cancel-button`,
  editSaveButton: (id) => `user-${id}-edit-save-button`,
  activateDialog: (id) => `activate-user-dialog-${id}`,
  activateCancelButton: 'activate-user-cancel-button',
  activateConfirmButton: 'activate-user-confirm-button',
  deactivateDialog: (id) => `deactivate-user-dialog-${id}`,
  deactivateCancelButton: 'deactivate-user-cancel-button',
  deactivateConfirmButton: 'deactivate-user-confirm-button',
  deleteDialog: (id) => `delete-user-dialog-${id}`,
  deleteCancelButton: 'delete-user-cancel-button',
  deleteConfirmButton: 'delete-user-confirm-button',
  infoOrganisation: (id) => `user-${id}-organisation`,
  infoCorporateAccount: (id) => `user-${id}-corporate-account`,
  infoPartnerwebId: (id) => `user-${id}-partnerweb-id`,
  infoName: (id) => `user-${id}-name`,
  infoEmail: (id) => `user-${id}-email`,
  infoStatus: (id) => `user-${id}-status`,
  infoCreatedAt: (id) => `user-${id}-created-at`,
  infoCreatedBy: (id) => `user-${id}-created-by`,
  infoUpdatedAt: (id) => `user-${id}-updated-at`,
  infoUpdatedBy: (id) => `user-${id}-updated-by`,
  addRoleButton: 'user-side-panel-add-role-button',
  roleEditButton: (roleValue) => `user-side-panel-role-edit-button-${roleValue}`,
  roleDeleteButton: (roleValue) => `user-side-panel-role-delete-button-${roleValue}`
} as const;
```
Wrapper `<div>` attributes (`UserPanel.tsx`): `id={USER_SIDE_PANEL_IDS.sidePanel(user.id)}`,
`data-user-id={String(user.id)}`, `aria-label="User details for {firstName} {lastName}"`,
`data-panel-state={USER_SIDE_PANEL_STATE.open}`.

Note the mismatch: `infoUpdatedAt` is reused for **both** "Aktualisiert am" and "Deaktiviert am" (inactive user) —
same id either way; disambiguate by user status if needed, not by a second id.

Edit-modal role rows (`SelectRolesForm.tsx`, wrapped in `QA_INLINE_WRAPPER_STYLE` from `shared/testIds/
qaWrapperStyle.ts`, `{ display: 'inline' }`): edit icon gets `roleEditButton(role.value)`, delete icon gets
`roleDeleteButton(role.value)`.

---

## 9. Teams — list page

File: `shared/testIds/teams.ids.ts` (not barrel-exported — import directly, though `index.ts` re-exports
`TEAMS_IDS`). Commit: `598f5a06`.
```ts
export const TEAMS_IDS = {
  tableRow: (teamId) => `team-row-${teamId}`,
  tableRowContextMenuButton: (teamId) => `team-${teamId}-context-menu-button`,
  contextMenuOption: {
    details: (teamId) => `team-${teamId}-menu-details`,
    edit: (teamId) => `team-${teamId}-menu-edit`,
    delete: (teamId) => `team-${teamId}-menu-delete`
  },
  pagination: 'teams-pagination'
} as const;
```
Row also gets `data-team-id`, `data-team-name`, `data-organisation` (all raw values). Context menu button also
gets `aria-label="Open actions for {teamName}"`. Pagination wrapper gets `aria-label="Teams pagination"`.

---

## 10. Team Side Panel

File: `shared/testIds/teamSidePanel.ids.ts` (not barrel-exported). Commit: `70515907` (the real POSS-3411 —
`fac12d79` is a 2-minutes-later fixup of two import lines only). **Not** covered by `usePanelIds()` — set
directly in `TeamPanel.tsx`.
```ts
export const TEAM_SIDE_PANEL_STATE = { open: 'open', closed: 'closed' } as const;
export const TEAM_SIDE_PANEL_IDS = {
  sidePanel: (teamId) => `team-side-panel-${teamId}`,
  deleteButton: (teamId) => `team-${teamId}-delete-button`,
  editButton: (teamId) => `team-${teamId}-edit-button`,
  editCancelButton: (teamId) => `team-${teamId}-edit-cancel-button`,
  editSaveButton: (teamId) => `team-${teamId}-edit-save-button`,
  addUserButton: (teamId) => `team-${teamId}-add-user-button`,
  addUserCancelButton: (teamId) => `team-${teamId}-add-user-cancel-button`,
  addUserApplyButton: (teamId) => `team-${teamId}-add-user-apply-button`,
  agentCheckbox: (teamId) => `team-${teamId}-agent-checkbox`,
  channelCheckbox: (teamId) => `team-${teamId}-channel-checkbox`,
  removeMemberButton: (teamId, userId) => `team-${teamId}member${userId}-remove-button`, // ⚠️ no dashes around "member", verified as-is in source
  deleteDialog: (teamId) => `delete-team-dialog-${teamId}`,
  deleteCancelButton: 'delete-team-cancel-button',
  deleteConfirmButton: 'delete-team-confirm-button',
  infoOrganisation: (teamId) => `team-${teamId}-organisation`,
  infoName: (teamId) => `team-${teamId}-name`
} as const;
```
Wrapper `<div>`: `id`, `data-team-id`, `aria-label="Team details for {teamName}"`, `data-panel-state`.
⚠️ `removeMemberButton` really does produce e.g. `team-7member42-remove-button` — no separating dash before
"member" or before the user id. Copy the pattern exactly; don't "fix" it when writing a selector.

---

## 11. Organizations — list page

File: `shared/testIds/organizations.ids.ts` (not barrel-exported). Commit: `93bd1748`.
```ts
export const ORGANIZATIONS_IDS = {
  tableRow: (orgId) => `organization-row-${orgId}`,
  tableRowNameCell: (orgId) => `organization-${orgId}-name`
} as const;
```
Row also gets `data-organization-id` and `aria-label={organization.name}`. No context-menu/pagination ids were
added for this list in the reviewed commits.

---

## 12. Organization Side Panel

File: `shared/testIds/organizationSidePanel.ids.ts` (not barrel-exported). Commit: `299f3cf9`. Not covered by
`usePanelIds()` — set directly in `OrganizationPanel.tsx`.
```ts
export const ORGANIZATION_SIDE_PANEL_STATE = { open: 'open', closed: 'closed' } as const;
export const ORGANIZATION_SIDE_PANEL_IDS = {
  sidePanel: (orgId) => `organization-side-panel-${orgId}`,
  closeButton: (orgId) => `organization-side-panel-${orgId}-close-button`,
  infoName: (orgId) => `organization-${orgId}-name`,
  infoEmailAddresses: (orgId) => `organization-${orgId}-email-addresses`,
  infoSalesRegion: (orgId) => `organization-${orgId}-sales-region`
} as const;
```
Wrapper `<div>`: `id`, `data-organization-id={String(selectedOrganization.id)}`,
`aria-label="Organization details for {name}"`, `data-panel-state`.

---

## 13. Imports — list page + filter bar + actions

File: `shared/testIds/imports.ids.ts` (not barrel-exported). Commits: `a6702d40` (list), `b1eb1e8a` (filter
bar + actions).
```ts
export const IMPORTS_IDS = {
  tableRow: (importId) => `import-row-${importId}`,
  tableRowImportCell: (importId) => `import-${importId}-col-import`,
  tableRowImportedBy: (importId) => `import-${importId}-imported-by`,
  tableRowBaulosCell: (importId) => `import-${importId}-col-baulos`,
  tableRowBaulosName: (importId) => `import-${importId}-baulos-name`,
  tableRowOrganisationCell: (importId) => `import-${importId}-col-organisation`,
  tableRowOrganisationName: (importId) => `import-${importId}-organisation-name`,
  tableRowStatusTag: (importId) => `import-${importId}-status`,
  revertButton: (importId) => `import-${importId}-revert-button`,
  pagination: 'imports-pagination',
  revertModal: (importId) => `import-${importId}-revert-modal`,
  revertModalCancelButton: (importId) => `import-${importId}-revert-cancel-button`,
  revertModalDeleteButton: (importId) => `import-${importId}-revert-delete-button`,
  revertModalCloseButton: (importId) => `import-${importId}-revert-close-button`
} as const;

export const IMPORTS_ACTIONS_IDS = {
  changeOrganizationButton: 'imports-change-organization-button',
  changeOrganizationModal: 'change-organization-modal',
  changeOrganizationCancelButton: 'change-organization-cancel-button',
  changeOrganizationConfirmButton: 'change-organization-confirm-button',
  importDataButton: 'imports-import-data-button',
  importDataModal: 'import-data-modal',
  importDataCancelButton: 'import-data-cancel-button',
  fileUploader: 'imports-file-uploader'
} as const;
```
Row also gets `data-import-id`, `data-import-type` (`system`/`user`), `aria-label="Import {id}"`.
Revert modal wrapper gets `aria-label="Revert import confirmation"`; both "change organization" and "import
data" modals get `aria-modal="true"` alongside their `id`. Import date-range filter uses the shared
`RangeFilterDate` pattern from §1.3, not a dedicated Imports id.

**No `revertModalCloseButton`/`changeOrganizationConfirmButton` dead-constant issue here** — unlike the
Configuration create modals in §14–16, every constant in both objects above is confirmed wired to a real
element in `b1eb1e8a`/`a6702d40`.

---

## 14. Configuration — navigation sidebar

File: `shared/testIds/configurationInteractionOutcomeList.ids.ts` (yes, the nav sidebar constant lives in the
Abschlussgründe file, not its own — that's simply where it was added). Commit: `f7ddeae1`.
```ts
export const CONFIGURATION_NAV_IDS = { sidebar: 'configuration-navigation-sidebar' } as const;
```
`VerticalNavigationTabs.tsx` root `<div>`: `id="configuration-navigation-sidebar"`,
`aria-label="Configuration navigation sidebar"`, `data-nav-items` = comma-joined list of the currently visible
tab **titles** (German page names as configured in `routesConfig`, e.g. `"Abschlussgründe,Aufgaben,Regime,..."`)
— exact title strings are **UNVERIFIED** here since `routesConfig` itself lives outside these 27 commits.
```ts
page.locator('#configuration-navigation-sidebar[data-nav-items*="Abschlussgründe"]');
```

---

## 15. Configuration — Abschlussgründe (Interaction Outcome)

File: `shared/testIds/configurationInteractionOutcomeList.ids.ts`. Commits: `f7ddeae1` (sidebar, table, detail,
nav tabs), `22cb59e5` (create modal), `f073e208`/`c5ced5a6` (import-formatting fixups only, no new ids).
```ts
export const INTERACTION_OUTCOME_LIST_CREATE_IDS = {
  button: 'create-interaction-outcome-button',
  modal: 'create-interaction-outcome-modal',
  closeButton: 'create-interaction-outcome-close-button', // 💀 dead — see below
  cancelButton: 'create-interaction-outcome-cancel-button',
  confirmButton: 'create-interaction-outcome-confirm-button'
} as const;
export const INTERACTION_OUTCOME_SIDEBAR_STATE = { open: 'open', closed: 'closed' } as const;
export const INTERACTION_OUTCOME_IDS = {
  sidebar: 'interaction-outcome-sidebar',
  tableRow: (outcomeId) => `interaction-outcome-row-${outcomeId}`,
  contextMenuButton: (outcomeId) => `interaction-outcome-${outcomeId}-context-menu-button`,
  childItem: (outcomeId) => `interaction-outcome-child-${outcomeId}`,
  childCloseButton: (outcomeId) => `interaction-outcome-child-${outcomeId}-close-button`,
  navChildItem: (outcomeId) => `interaction-outcome-nav-child-${outcomeId}`,
  navChildCloseButton: (outcomeId) => `interaction-outcome-nav-child-${outcomeId}-close-button`
} as const;
```
| Element | Attribute | Pattern |
|---|---|---|
| Sidebar wrapper (`InteractionOutcome.tsx`) | `id` + `aria-label` | `interaction-outcome-sidebar` / `"Interaction outcome sidebar"` |
| Sidebar wrapper | `data-sidebar-state` | `open` if any item selected, else `closed` |
| Table row | `id` | `interaction-outcome-row-{id}` |
| Table row | `data-outcome-id`, `data-display-name`, `data-final-result`, `data-customer-contact`, `data-status` | see §4 of the discrepancy report — this is one of only 3 tables with a real `data-display-name` |
| Context menu button | `id` + `aria-label` | `interaction-outcome-{id}-context-menu-button` / `"Open interaction outcome actions"` |
| Detail panel wrapper (`InteractionOutcomeDetail.tsx`) | `id`, `data-outcome-id`, `data-display-name` | `interaction-outcome-child-{id}` |
| Detail panel close button | `id` (`<div>` wrapper) + `aria-label` | `interaction-outcome-child-{id}-close-button` / `"Close interaction outcome {id}"` |
| Nav sidebar tab item (`<NavLink>`) | `id`, `data-outcome-id`, `data-display-name` | `interaction-outcome-nav-child-{id}` |
| Nav sidebar tab close button (`<span>` wrapper — inside `<a>`) | `id` + `aria-label` | `interaction-outcome-nav-child-{id}-close-button` |
| "Abschlussgrunde erstellen" button | `id` (wrapper) + `aria-label` | `create-interaction-outcome-button` / `"Create interaction outcome"` |
| Create modal wrapper | `id` + `aria-label` + `aria-modal` | `create-interaction-outcome-modal` |
| Create modal — cancel | `id` | `create-interaction-outcome-cancel-button` |
| Create modal — confirm | `id` | `create-interaction-outcome-confirm-button` |
| 💀 Create modal — close (X) | *(none)* | `closeButton` constant exists but is **never applied** — the X lives in the unmodified shared `ModalFormWrapper` by deliberate decision (don't edit a shared component). Locate the modal's X via `role`/icon, not this id. |

---

## 16. Configuration — Aufgaben (Sales Action Tasks)

File: `shared/testIds/configurationSalesActionTaskList.ids.ts`. Commit: `8644e934`.
```ts
export const SALES_ACTION_TASK_IDS = { tableRow: (taskId) => `task-row-${taskId}` } as const;
export const SALES_ACTION_TASK_CREATE_IDS = {
  button: 'create-task-button',
  modal: 'create-task-modal',
  closeButton: 'create-task-close-button', // 💀 dead, same reason as §15
  cancelButton: 'create-task-cancel-button',
  confirmButton: 'create-task-confirm-button'
} as const;
```
Row: `id="task-row-{id}"`, plus `data-task-id`, `data-task-type`, `data-display-name` (mapped from
`tasks.taskName`). Create button wrapper: `id="create-task-button"` + `aria-label="Create task"`. Create modal
wrapper: `id="create-task-modal"` + `aria-label`/`aria-modal`; cancel/confirm buttons as listed; `closeButton` is
dead, same caveat as §15.

---

## 17. Configuration — Regime

File: `shared/testIds/configurationRegimeList.ids.ts` (list) + `configurationRegimeListCreate.ids.ts` (create).
Commits: `9f86c608` (list), `f073e208` (create modal).
```ts
export const REGIME_IDS = {
  tableRow: (regimeId) => `regime-row-${regimeId}`,
  contextMenuButton: (regimeId) => `regime-${regimeId}-context-menu-button`
} as const;
export const REGIME_LIST_CREATE_IDS = {
  button: 'create-regime-button',
  modal: 'create-regime-modal',
  cancelButton: 'create-regime-cancel-button',
  confirmButton: 'create-regime-confirm-button'
} as const;
```
Row: `id="regime-row-{id}"`, plus `data-regime-id`, `data-object-type` (from `regime.typeName`), `data-regime`
and `data-display-name` (both from `regime.subTypeName` — genuinely duplicated onto two different attribute
names), `data-sub-type`, `data-created-at` (formatted). Context menu button: `id` + `aria-label="Open actions
for {regimeName}"`. **No `closeButton` constant exists for this create modal at all** — unlike Abschlussgründe/
Aufgaben, this one was never defined, so there's nothing dead to warn about here.
```ts
const row = page.locator('#regime-row-5');
await row.locator('#regime-5-context-menu-button').click();
page.locator('[data-object-type="NEUBAU"]');
```

---

## 18. Configuration — Aktivitäten Setup

File: `shared/testIds/configurationActivitySetupList.ids.ts`. Commits: `396bccab` (list + context menu),
`c5ced5a6` (create button).
```ts
export const ACTIVITY_SETUP_IDS = {
  tableRow: (setupId) => `activity-setup-row-${setupId}`,
  contextMenuButton: (setupId) => `activity-setup-${setupId}-context-menu-button`
} as const;
export const ACTIVITY_SETUP_CREATE_IDS = { button: 'create-activity-setup-button' } as const;
```
Row: `id="activity-setup-row-{id}"`, plus `data-activity-setup-id`, `data-object-type`, `data-regime`,
`data-task`. **No `data-display-name` here** — easy to assume it matches Regime/Aufgaben since it's the
adjacent ticket, but it doesn't. Context menu button (plain inline `<div>`, no separate component this time):
`id` + `aria-label="Open activity setup actions"`. Create button wrapper: `id="create-activity-setup-button"` +
`aria-label="Create activity setup"`.

**Deferred / doesn't exist yet (confirmed by the commit's own `onClick={() => {}}` no-op):** the create modal
for Aktivitäten Setup does not exist in the codebase as of `c5ced5a6`; clicking the create button currently does
nothing. There is also no file-upload feature for this page yet. Don't write tests expecting either.

---

## Common Playwright patterns

```ts
// Scope inside a side panel
const userPanel = page.locator('#user-side-panel-42');
await userPanel.locator('#user-42-edit-button').click();

// Scope inside a modal
const modal = page.locator('#create-regime-modal');
await modal.locator('#create-regime-cancel-button').click();

// Panel/sidebar open-state checks
page.locator('#user-side-panel-42[data-panel-state="open"]');
page.locator('#team-side-panel-7[data-panel-state="open"]');
page.locator('#organization-side-panel-3[data-panel-state="open"]');
page.locator('#interaction-outcome-sidebar[data-sidebar-state="open"]');

// Filter table rows by data attribute (works for Objects, Sales Actions, Users, Teams,
// Organizations, Imports, Interaction Outcome, Aufgaben, Regime, Activity Setup —
// NOT for Baulose, which has no data-* attributes at all, see §2)
page.locator('tr[data-object-type="NEUBAU"]');
page.locator('tr[data-regime="Grundversorgung"]');

// Quick filter
await page.locator('#quick-filter-objectType-NEUBAU').click();
await expect(page.locator('#quick-filter-objectType-NEUBAU')).toHaveAttribute('aria-pressed', 'true');

// Status chip (Sales Action panel only)
await expect(page.locator('[role="status"]')).toHaveAttribute('aria-label', 'closed - positive');

// data-testid (the one confirmed exception to "everything is id")
await page.getByTestId('sales-action-55-customer-interaction-1-toggle').click();
```

---

## Known gaps / things this initiative deliberately did not touch

- Modal close (X) buttons everywhere — always the shared, unmodified `ModalFormWrapper`; never given a stable
  id anywhere in POSS-3397–3422. Three `.ids.ts` files (`configurationInteractionOutcomeList`,
  `configurationSalesActionTaskList`) still *define* an unused `closeButton` constant as a leftover; Regime's
  create-modal file never defined one at all. Treat all "close button id" claims as dead unless a future ticket
  proves otherwise.
- `SearchFieldRow` (Benutzerverwaltung, Importe, etc.) — never touched, no stable id; use
  `getByPlaceholder(...)` as a fallback.
- Aktivitäten Setup create modal and file uploader — don't exist yet (§18).
- Sales Action side panel "Notiz" UI — no stable id (§6).
- Neubau object panel's "Bearbeiten" action-bar button, the Lokation collapse toggle, and the assign/reject
  buttons — had ids briefly, removed in the very next commit, never restored (§4.4).

## Appendix — ticket → commit map

| Ticket | Commit(s) | Area |
|---|---|---|
| POSS-3397 | `282c9525` | `FilterDropDownButton` gets an `id` prop |
| POSS-3398 | `00708325` | Baulose test ids (first pass) |
| POSS-3399 | `94640e07` | Quick filter ids (first pass) |
| refactor | `d593b02e` | Centralizes 3397/3398/3399/3402/3403 into `testIds/*.ids.ts` |
| POSS-3402 | `e5ffc159` | Objects list ids (inline, pre-refactor) |
| POSS-3403 | `e2065988`, `77cc702c` | Object side panel (Context → hook rewrite) |
| POSS-3404 | `d8393bf6`, `271a0f49` | **Sales Actions list view** (not the panel) |
| POSS-3405 | `83c71c52` | Sales Action side panel |
| POSS-3406 | `bd4292b1` | Capture Activity modal |
| POSS-3407 | `de96e3c0` (+trivial `a1b409c0`) | User Admin filter bar, `aria-pressed`, create buttons |
| POSS-3408 | `7de4cbb8` | User Admin list |
| POSS-3409 | `b61064d4` | User side panel |
| POSS-3410 | `598f5a06` | Teams list |
| POSS-3411 | `70515907` (+trivial `fac12d79`) | Team side panel |
| POSS-3412 | `93bd1748` | Organizations list |
| POSS-3413 | `299f3cf9` | Organization side panel |
| POSS-3414 | `a6702d40` | Imports list |
| POSS-3415 | `b1eb1e8a` | Imports filter bar + actions, `RangeFilterDate` |
| POSS-3416 | `f7ddeae1` | Abschlussgründe sidebar/list/detail/nav |
| POSS-3417 | `22cb59e5` | Abschlussgründe create modal |
| POSS-3418 | `8644e934` | Aufgaben list + create modal |
| POSS-3419 | `9f86c608` (+near-dup `bf6f00e1`) | Regime list |
| POSS-3420 | `f073e208` | Regime create modal |
| POSS-3421 | `396bccab` | Aktivitäten Setup list |
| POSS-3422 | `c5ced5a6` | Aktivitäten Setup create button + import-format fix |

(POSS-3400 = unrelated Baulose import-date sorting, out of scope. POSS-3401 does not exist.)

## 2026-09-17 addendum — Sales Action assigned-to attributes still missing

`SalesActionAssignedTo.tsx` is shared by the Neubau, FTTH-AUSBAU, and Bestandsbau Sales Action
tables. Its outer container, assignee-name area, individual assignee entries, Organisation line,
and optional object-status line currently have generated CSS-module classes only; POSS-3404 did
not add stable attributes to them. The component also renders only the first three assignees and
uses ` ...` when more exist.

Temporary automation fallback: scope exact assignee visible-text lookup to the stable
`#sales-action-row-{salesActionId}` row and allow the rendered comma/ellipsis suffix. Do not use
the generated classes. Future frontend work should add an assigned-to container id, a stable
assignees wrapper, per-assignee id/data attributes (prefer user id when available), and a stable
Organisation id. The design must account for filtered assignees beyond the three visibly
rendered names; attributes on visible entries alone do not solve that case.
