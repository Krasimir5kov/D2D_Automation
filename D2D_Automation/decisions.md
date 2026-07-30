# D2D Automation — Architecture Decisions Log

Decisions recorded here are **in force**. Do not suggest reversing them without raising it with the team first.

---

## ADR-001 — Hash-based SPA routing

**Decision:** D2D is a React SPA with hash-based routing. All routes start with `#/`.

**Impact on automation:**
- `buildDoor2DoorUrl()` in `BasePage.ts` handles route normalization
- Routes stored as `'#/baulose/ftth'` etc. in `door2doorRoutes`
- `page.goto()` with hash routes works correctly — Playwright handles these natively
- URL assertions use regex: `await expect(page).toHaveURL(/\/door2door#\/baulose\/ftth/)`

---

## ADR-002 — No shared component modification

**Decision:** Never add `id` props or attributes directly to shared GuCCI (`@a1/gucci-common-ui-react`) components or any shared D2D component.

**Reason:** Modifying shared components risks breaking every consumer across the app.

**Pattern:** Always wrap the component instance with a `div` (block context) or `span` (inline/inside `<a>`) and apply the id to the wrapper:

```tsx
// ✅ CORRECT — wrapper div outside the GuCCI component
<div id={IDS.createButton} aria-label="Create regime" style={{ display: 'inline' }}>
  <GucciLinkButton label="Erstellen" onClick={handleCreate} />
</div>

// ✅ CORRECT — inside <NavLink> (renders as <a>), use <span> not <div>
<span id={IDS.closeButton} style={{ display: 'inline' }}>
  <CancelIconButton />
</span>

// ❌ WRONG — modifying the GuCCI component directly
<GucciLinkButton id={IDS.createButton} ... />
```

**Note:** `display: contents` must never be used on wrapper divs — it breaks CSS sibling selectors.

---

## ADR-003 — `usePanelIds()` hook over React Context

**Decision:** Use `usePanelIds()` hook reading `useLocation().pathname` to derive panel IDs. Rejected `React.createContext` (`PanelTestIdContext`).

**Reason:** Context approach required re-renders on every panel open. Hook reads the URL once per render, simpler and more predictable.

**Location:** `src/frontend/shared/testIds/usePanelIds.ts`

**How it works:**
- pathname includes `/neubau/` → returns `OBJECT_PANEL_IDS.neubau`
- pathname includes `/ftth/` → returns `OBJECT_PANEL_IDS.ftth`
- pathname includes `/bestandsbau/` → returns `OBJECT_PANEL_IDS.bestandsbau`
- Same hook used for both Object panel and Sales Action panel

---

## ADR-004 — `isTableData` type guard fix

**Decision:** The `isTableData` guard in `typeGuards.ts` was changed from `!!typecastedEntry?.content` to a proper object + key check.

**Reason:** `TableData.content` can be `0` or `null` — both falsy but valid values. The old truthy check silently dropped `cellAttributes` wiring for those rows, breaking the `rowAttributes` spread on affected `<tr>` elements.

```ts
// ✅ CORRECT (applied in POSS-3402)
return typeof typecastedEntry === 'object' && typecastedEntry !== null && 'content' in typecastedEntry;

// ❌ OLD — fails for falsy-but-valid content values
return !!typecastedEntry?.content;
```

---

## ADR-005 — `rowAttributes` pattern for table rows

**Decision:** Table rows carry automation attributes via the `rowAttributes` prop spread on `<tr>` in `TableEntry.tsx`.

**Standard shape:**
```ts
rowAttributes: {
  id: IDS.tableRow(entity.id),           // stable unique id
  'data-entity-id': String(entity.id),   // numeric id as string
  'data-display-name': entity.name ?? '',
  'data-object-type': entity.type ?? ''
}
```

**In Playwright:** Prefer `#row-id` for direct access, `[data-display-name="..."]` for human-readable assertions, `[data-object-type="NEUBAU"]` for filtered sets.

---

## ADR-006 — GuCCI AccordionItem `id` preservation

**Decision:** When adding `data-testid` to a GuCCI `AccordionItem`, the existing `id` attribute must be preserved.

**Reason:** The accordion component uses `id` internally for open/closed state tracking. Replacing or removing it breaks the accordion behavior.

---

## ADR-007 — FileUploaderAttachmentItem delete button

**Decision:** The internal delete button inside `FileUploaderAttachmentItem` is not given a direct ID.

**Reason:** Replacing it would require using the `contextMenu` prop which changes the visual rendering. Not worth the risk.

**Playwright approach:** Use the row-level wrapper ID to scope all interactions within the attachment row:
```ts
const attachmentRow = page.locator('#attachment-row-id')
await attachmentRow.getByRole('button').click() // scoped to that row
```

---

## ADR-008 — `data-nav-items` comma-separated pattern

**Decision:** The `VerticalNavigationTabs` sidebar encodes visible tab titles as a comma-separated string in `data-nav-items`.

**Why:** Allows Playwright to assert which tabs are currently open without opening each one:
```ts
page.locator('#configuration-navigation-sidebar[data-nav-items*="Mein Tab"]')
```

---

## ADR-009 — `data-sidebar-state` for sidebar open/closed

**Decision:** The Abschlussgründe sidebar wrapper has `data-sidebar-state="open"` or `"closed"` driven by whether any items are selected.

**Playwright:**
```ts
await expect(page.locator('#interaction-outcome-sidebar[data-sidebar-state="open"]')).toBeVisible()
```

---

## ADR-010 — Manual 2FA auth with storageState reuse

**Decision:** Auth setup is manual (headed Chrome, tester completes 2FA by hand). Saved `user.json` is reused across runs unless `REUSE_AUTH_STATE=false` or `npm run auth:clear`.

**Reason:** D2D uses corporate SSO with 2FA that cannot be automated without storing credentials insecurely.

**Key behaviour:** `test.skip(shouldReuseExistingAuthState, ...)` runs before Playwright creates the browser — this is intentional and correct. It avoids launching a headed window when auth is already valid.

---

## ADR-011 — English-only ID constants and attribute values

**Decision:** All constants in `testIds/` files, all `id` values, `aria-label` values, and file/variable names must be in English. No German words in automation-facing identifiers.

**Reason:** Consistent, searchable, avoids encoding issues with umlauts in selectors.

**Examples:**
```ts
// ✅ CORRECT
'create-interaction-outcome-button'
aria-label="open"
aria-label="closed - positive"

// ❌ WRONG
'erstellen-abschlussgrund-button'
aria-label="offen"
```

---

## ADR-012 — One branch per POSS ticket

**Decision:** Each POSS attribute ticket (`POSS-3402` → `POSS-3422`) lives on its own isolated git branch in the frontend repo.

**Impact on automation:** When writing tests for a section, confirm the corresponding POSS branch has been merged to main before relying on its IDs. Check `references/testids-map.md` known gaps section for what is not yet live.

---

## Known formatting contamination

`InteractionOutcome.tsx` in the frontend has a malformed import on `main` branch (space before comma). `npm run format` corrects it on every branch, making the file appear as modified in every PR. A dedicated formatting-only PR to `main` is needed to fix this permanently. Until then, let `npm run format` correct it and include it in the PR alongside task changes.
