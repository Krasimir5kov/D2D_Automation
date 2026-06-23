# D2D Application Overview

**Generated:** 2026-06-23  
**Source data:** DOM inspection run 2026-06-20  
**App title:** Door 2 Door  
**Base URL:** `https://portal-int.open-frontends.a1.net/door2door`

---

## Application Structure

### Navigation

The app uses a hash-based router (`#/route`). The top header contains navigation links to all main sections.

| Page | Route | URL |
|------|-------|-----|
| Baulose | `#/baulose/ftth` | `https://portal-int.open-frontends.a1.net/door2door#/baulose/ftth` |
| Objekte | `#/objekte/neubau` | `https://portal-int.open-frontends.a1.net/door2door#/objekte/neubau` |
| Sales Action | `#/sales-actions` | (inspected at `/objekte/neubau` — see note below) |
| Benutzerverwaltung | `#/benutzerverwaltung/users` | `https://portal-int.open-frontends.a1.net/door2door#/benutzerverwaltung/users` |
| Importe | `#/importe` | `https://portal-int.open-frontends.a1.net/door2door#/importe` |
| Konfiguration | `#/konfiguration/übersicht` | `https://portal-int.open-frontends.a1.net/door2door#/konfiguration/%C3%BCbersicht` |

> **Note:** The Sales Action inspection was recorded at the Objekte URL — the Sales Action module appears to share list-level functionality with Objekte and has its own route at `#/sales-actions`.

#### Header Navigation Locators (from door2door-playwright-locators.ts)

```typescript
navigation(page).baulose          // link(page, /^Baulose$/i)
navigation(page).objects          // link(page, /^Objekte$/i)
navigation(page).salesActions     // link(page, /^Sales Action$/i)
navigation(page).userAdministration // link(page, /^Benutzerverwaltung$/i)
navigation(page).imports          // link(page, /^Importe$/i) — admin only
navigation(page).configuration    // link(page, /^Konfiguration$/i) — admin only
navigation(page).bookAppointment  // button — behind feature toggle
```

#### Configuration Sub-Routes

| Section | Route |
|---------|-------|
| Übersicht | `#/konfiguration/uebersicht` |
| Abschlussgründe | `#/konfiguration/abschlussgruende` |
| Aufgaben | `#/konfiguration/aufgaben` |
| Gruppen | `#/konfiguration/gruppen` |
| Regime | `#/konfiguration/regime` |
| Aktivitäten-Setup | `#/konfiguration/aktivitaeten-setup` |

---

## Baulose

**URL:** `https://portal-int.open-frontends.a1.net/door2door#/baulose/ftth`  
**Inspected:** 2026-06-20  
**Button count:** 18  
**Modals:** 0  
**Side panels:** 0  

The Baulose page lists construction lots (Baulose / Einsätze) and is divided into two tabbed list sections: FTTH-Ausbau and Bestandsbau. A search field and four filter dropdowns are available at the top of the page.

### Search Field

- Input ID: `baulose-search-field` (type: text)
- Placeholder hint from locators: "Suche nach Baulose/Einsatznamen"
- Playwright locator: `page.getByPlaceholder(/Suche nach Baulose\/Einsatznamen/i)`

### Baulose FTTH-Ausbau List

- **URL:** `https://portal-int.open-frontends.a1.net/door2door#/baulose/ftth`
- **Tab locator:** `link(page, /FTTH/i).or(tab(page, /FTTH/i))`
- **What the list shows:** Baulose / Einsatz entries for FTTH construction lots
- **Items at inspection time:** 0 (empty data state)
- **Table locator:** `page.locator('table, [role="table"], [class*="BaulosTable"], [class*="Table"]').first()`

### Baulose Bestandsbau List

- **URL:** `https://portal-int.open-frontends.a1.net/door2door#/baulose/ftth` (tab switch, same base URL)
- **Tab locator:** `link(page, /Bestandsbau/i).or(tab(page, /Bestandsbau/i))`
- **What the list shows:** Baulose entries for Bestandsbau construction
- **Items at inspection time:** 0 (empty data state)

### Baulose Filter Bar

Four inline filter dropdowns are visible in the filter bar. These are `div[role="button"]` elements with text labels — no `data-testid` or `aria-*` attributes present.

| Filter | Locator |
|--------|---------|
| Organisation | `page.getByRole('button', { name: 'Organisation' })` |
| Regime | `page.getByRole('button', { name: 'Regime' })` |
| Phase | `page.getByRole('button', { name: 'Phase' })` |
| Status | `page.getByRole('button', { name: 'Status' })` |

> All filter locators are **MODERATE** stability — they rely on visible text and will break if labels are translated or renamed.

### Baulose Row Action

Each row contains a "zu Sales Actions" navigation button (3 instances visible at inspection time, one per row):

- **Locator:** `page.getByRole('button', { name: 'zu Sales Actions' })`
- **Safety class:** SAFE_NAVIGATION
- **Action:** Navigates to the Sales Actions page filtered to the selected Baulos

### Pagination

| Control | Locator |
|---------|---------|
| Page size (25) | `page.getByRole('button', { name: '25' })` |
| Page 1 | `page.getByRole('button', { name: '1' })` |
| Next page | `button(page, /weiter|next|naechste/i)` |
| Previous page | `button(page, /zurueck|zurück|previous/i)` |

---

## Objekte

**URL:** `https://portal-int.open-frontends.a1.net/door2door#/objekte/neubau`  
**Inspected:** 2026-06-20  
**Button count:** 31  
**Modals:** 1 (Alle Filter)  
**Side panels:** 0 captured (Object side panel opens on row click — not captured in this inspection run)  

The Objekte page lists objects (addresses/buildings) across three tabs: Neubau, FTTH-Ausbau, and Bestandsbau. It has an inline filter bar plus an "alle Filter" button that opens a full filter modal.

### Search Field

- Input ID: `objects-search-field` (type: text)
- Playwright locator: `page.locator('input[placeholder*="Suche"]').first()`

### Objekte Neubau List

- **URL:** `https://portal-int.open-frontends.a1.net/door2door#/objekte/neubau`
- **Tab locator:** `link(page, /Neubau/i).or(tab(page, /Neubau/i))`
- **Items at inspection time:** 0 (empty data state)

### Objekte FTTH List

- **Tab locator:** `link(page, /FTTH/i).or(tab(page, /FTTH/i))`
- **Items at inspection time:** 0

### Objekte Bestandsbau List

- **Tab locator:** `link(page, /Bestandsbau/i).or(tab(page, /Bestandsbau/i))`
- **Items at inspection time:** 0

### Objekte Filter Bar (Inline)

| Filter | Locator | Stability |
|--------|---------|-----------|
| alle Filter (opens modal) | `page.getByRole('button', { name: 'alle Filter' })` | MODERATE |
| nicht übergeben | `page.getByRole('button', { name: 'nicht übergeben' })` | MODERATE |
| zurückgewiesen | `page.getByRole('button', { name: 'zurückgewiesen' })` | MODERATE |
| übergeben | `page.getByRole('button', { name: 'übergeben' })` | MODERATE |
| Baulos/Einsatzname | `page.getByRole('button', { name: 'Baulos/Einsatzname' })` | MODERATE |
| PLZ | `page.getByRole('button', { name: 'PLZ' })` | MODERATE |
| Organisation | `page.getByRole('button', { name: 'Organisation' })` | MODERATE |
| Verkaufsstart | `page.getByRole('button', { name: 'Verkaufsstart' })` | MODERATE |
| Fragebogen | `page.getByRole('button', { name: 'Fragebogen' })` | MODERATE |

### Objekte Alle Filter Modal

- **Trigger:** Click "alle Filter" button
- **Close:** × button inside dialog, "Alle Filter entfernen" button, or Escape key
- **Modal locator:** `page.getByRole('dialog')`

**Filter sections and options inside the modal:**

| Section | Options |
|---------|---------|
| Übergabestatus | nicht übergeben, zurückgewiesen, übergeben |
| Baulos/Einsatzname | free text search |
| PLZ | PLZ - Bereich, exakte PLZ |
| Organisation | Network Nord, NMAV NÖ 1, NMAV NÖ 2 |
| Verkaufsstart-Termin | in den nächsten 8 Tagen, in den nächsten 6 Wochen |
| (additional) | Vor Aviso, Bestätigt, Ersttermin, vollständig, unvollständig |

**Key locators for modal:**
```typescript
page.getByText('alle Filter', { exact: false })          // trigger
page.getByRole('dialog')                                  // modal container
page.locator('[role="dialog"] button').filter({ hasText: '×' })  // close button
```

### Objekte Side Panel (Object Details)

The side panel opens when a user clicks a row in the Objekte table. It was not captured in this inspection run but is fully documented in the Playwright locator library.

- **Panel locator:** `page.locator('[class*="SidePanel"]').filter({ hasText: /OBJEKT:/i })`
- **How to open:** Click a table row in the Objekte list

**Tabs in the Object side panel:**

| Tab | Locator |
|-----|---------|
| Übersicht (info) | `link(page, /uebersicht/i).or(tab(page, /uebersicht/i))` |
| Fragebogen | `link(page, /fragebogen/i).or(tab(page, /fragebogen/i))` — Neubau only |
| D2D Verkauf | `link(page, /D2D Verkauf/i).or(tab(page, /D2D Verkauf/i))` |
| Objekt SA | `link(page, /Objekt SA/i).or(tab(page, /Objekt SA/i))` — Neubau only |

**Actions/buttons in the Object side panel:**

| Action | Locator | Notes |
|--------|---------|-------|
| Bearbeiten | `button(page, /bearbeiten/i)` | Edit object / status details |
| Zurückweisen | `button(page, /zurueckweisen/i)` | Submit rejection status |
| Verkaufsstand hinzufügen | `button(page, /Verkaufsstand hinzufuegen/i)` | Create/generate sales action |
| zu Sales Actions wechseln | `button(page, /zu Sales Actions wechseln/i)` | Navigate to related Sales Actions |
| Fragebogen bearbeiten | `button(page, /Fragebogen bearbeiten/i)` | Switch questionnaire to edit mode |
| Speichern | `button(page, /Speichern/i)` | Save questionnaire |
| Bearbeiten (Verkaufsstart) | `button(page, /Bearbeiten/i)` | Open sales start edit controls |

---

## Sales Actions

**URL:** `https://portal-int.open-frontends.a1.net/door2door#/sales-actions`  
**Inspected:** 2026-06-20 (recorded at objekte/neubau URL — same component structure)  
**Button count:** 31  
**Modals:** 1 (Alle Filter — identical to Objekte)  
**Side panels:** 0 captured (Sales Action side panel opens on row click)

The Sales Actions page lists individual sales action records. It shares the same tab/filter/list structure as Objekte but the side panel has a richer set of tabs and actions. Three tab types: Neubau, FTTH, Bestandsbau.

### Search Field

- Input ID: `objects-search-field` (type: text)
- Playwright locator: `page.locator('input[placeholder*="Suche"]').first()`

### Sales Actions Tabs

| Tab | Locator |
|-----|---------|
| Neubau | `link(page, /Neubau/i).or(tab(page, /Neubau/i))` |
| FTTH | `link(page, /FTTH/i).or(tab(page, /FTTH/i))` |
| Bestandsbau | `link(page, /Bestandsbau/i).or(tab(page, /Bestandsbau/i))` |

### Sales Actions Filter Bar (Inline)

Same inline filters as Objekte:

| Filter | Locator |
|--------|---------|
| alle Filter | `page.getByRole('button', { name: 'alle Filter' })` |
| nicht übergeben | `page.getByRole('button', { name: 'nicht übergeben' })` |
| zurückgewiesen | `page.getByRole('button', { name: 'zurückgewiesen' })` |
| übergeben | `page.getByRole('button', { name: 'übergeben' })` |
| Baulos/Einsatzname | `page.getByRole('button', { name: 'Baulos/Einsatzname' })` |
| PLZ | `page.getByRole('button', { name: 'PLZ' })` |
| Organisation | `page.getByRole('button', { name: 'Organisation' })` |
| Verkaufsstart | `page.getByRole('button', { name: 'Verkaufsstart' })` |
| Fragebogen | `page.getByRole('button', { name: 'Fragebogen' })` |

### Sales Actions Alle Filter Modal

Identical to the Objekte Alle Filter modal — same fields, same filter sections, same locator patterns. See Objekte section above.

### Sales Actions Side Panel

Opens when a user clicks a row in the Sales Actions table.

- **Panel locator:** `page.locator('[class*="SidePanel"]').first()`
- **How to open:** Click a table row

**Tabs in the Sales Action side panel:**

| Tab | Locator | Notes |
|-----|---------|-------|
| Übersicht | `link(page, /uebersicht/i).or(tab(page, /uebersicht/i))` | Info/overview |
| Kundendaten | `link(page, /kund/i).or(tab(page, /kund/i))` | Customer contact info |
| Aktivitäten | `link(page, /aktivitaet/i).or(tab(page, /aktivitaet/i))` | Customer interactions |
| Dokumente | `link(page, /dokument/i).or(tab(page, /dokument/i))` | Document upload/list |
| Bestellstatus | `link(page, /bestellstatus/i).or(tab(page, /bestellstatus/i))` | FTTH/orderable actions only |
| Precontracting | `link(page, /precontracting/i).or(tab(page, /precontracting/i))` | Second-run flow |

**Actions/buttons in the Sales Action side panel:**

| Action | Locator | Purpose |
|--------|---------|---------|
| Aktivität erfassen | `button(page, /Aktivitaet erfassen/i)` | Opens CaptureActivityModal |
| Auftrag/Vertrag erfassen | `button(page, /auftrag|bestellung|vertrag|erfassen/i)` | Loads sales microflow |
| Partnerweb | `button(page, /Partnerweb/i)` | Opens Partnerweb link |
| Planskizze | `button(page, /Planskizze/i)` | Opens/downloads plan sketch |
| Einverständnis | `button(page, /einverstaendnis/i)` | Opens consent/declaration flow |
| Sales Action löschen | `button(page, /Sales Action loeschen/i)` | Opens delete confirmation modal |
| Nicht angetroffen | `page.locator('button').filter({ hasText: /nicht angetroffen/i })` | Shortcut: records "not met" |
| Nicht erreicht | `page.locator('button').filter({ hasText: /nicht erreicht/i })` | Shortcut: records "not reached" |
| Bearbeiten | `button(page, /bearbeiten/i)` | Edit status/assignment/details |
| Zuweisen/Übernehmen | `button(page, /zuweisen|uebernehmen/i)` | Confirms assignment mutation |
| Termin verwalten | `button(page, /Termin verwalten/i)` | Appointment management widget |
| Termin buchen | `button(page, /Termin buchen/i)` | Booking external widget |
| Öffnen in OMC | `button(page, /Oeffnen in OMC/i)` | Opens OMC URL (order status tab) |
| Dokument behalten | `button(page, /Dokument behalten/i)` | Cancels document deletion |
| Ja, Dokument löschen | `button(page, /Ja, Dokument Loeschen/i)` | Confirms document deletion |

### Sales Actions Row Operations

```typescript
salesActions(page).rowByText(text)       // locates a row by visible text
salesActions(page).contextMenuInRow(text) // last button in the row = context menu
salesActions(page).rowCheckbox(text)      // checkbox in the row for bulk actions
```

---

## Benutzerverwaltung

**URL:** `https://portal-int.open-frontends.a1.net/door2door#/benutzerverwaltung/users`  
**Inspected:** 2026-06-20  
**Button count:** 67  
**Modals:** 1 captured (Team erstellen) — additional modals known from locator library  
**Side panels:** 0 captured  

User administration area with three tabs: Benutzer (Users), Teams, Organisationen.

### Search Field

- Input ID: `shared-search-field` (type: text)

### Benutzerverwaltung Tabs

| Tab | Locator |
|-----|---------|
| Benutzer | `link(page, /Benutzer/i).or(tab(page, /Benutzer/i))` |
| Teams | `link(page, /Teams/i).or(tab(page, /Teams/i))` |
| Organisationen | `link(page, /Organisationen/i).or(tab(page, /Organisationen/i))` |

### Benutzerverwaltung Action Row Buttons

| Button | Safety Class | Locator |
|--------|-------------|---------|
| Benutzer erstellen | RISKY_DATA_CHANGE | `page.getByRole('button', { name: 'Benutzer erstellen' })` |
| Team erstellen | RISKY_DATA_CHANGE | `page.getByRole('button', { name: 'Team erstellen' })` |
| Admin A1 erstellen | RISKY_DATA_CHANGE | `page.getByRole('button', { name: 'Admin A1 erstellen' })` |

### Benutzerverwaltung Filter Bar (Users Tab)

| Filter | Locator |
|--------|---------|
| aktiv | `page.getByRole('button', { name: 'aktiv' })` |
| inaktiv | `page.getByRole('button', { name: 'inaktiv' })` |
| ohne Rolle | `page.getByRole('button', { name: 'ohne Rolle' })` |
| Organisation | `page.getByRole('button', { name: 'Organisation' })` |
| Rolle | `page.getByRole('button', { name: 'Rolle' })` |

### Users List

- **Table locator:** `page.locator('table, [role="table"], [class*="Users"], [class*="Table"]').first()`
- **Row by text:** `page.locator('tr, [role="row"]').filter({ hasText: text })`
- **Clicking a row:** Opens the User side panel

### User Side Panel

- **Panel locator:** `page.locator('[class*="SidePanel"]').filter({ hasText: /Benutzer|User/i })`

**Tabs in the User side panel:**

| Tab | Locator |
|-----|---------|
| Benutzerdaten / Details | `tab(page, /Benutzerdaten|Details/i)` |
| Rollen / Teams | `tab(page, /Rollen|Teams/i)` |

**Actions in the User side panel:**

| Action | Locator |
|--------|---------|
| Bearbeiten | `button(page, /Bearbeiten/i)` |
| Deaktivieren | `button(page, /Deaktivieren/i)` |
| Aktivieren | `button(page, /Aktivieren/i)` — inactive users only |
| Löschen | `button(page, /Loeschen/i)` |

**Form fields (create/edit user):**

| Field | Locator |
|-------|---------|
| Benutzername | `page.getByLabel(/Benutzername|Username/i)` |
| Vorname | `page.getByLabel(/Vorname/i)` |
| Nachname | `page.getByLabel(/Nachname/i)` |
| E-Mail | `page.getByLabel(/E-Mail|Email/i)` |
| Organisation | `page.getByLabel(/Organisation/i)` |

### Teams List

- **Table locator:** `page.locator('table, [role="table"], [class*="Teams"], [class*="Table"]').first()`
- **Clicking a row:** Opens the Team side panel
- **Team side panel:** `page.locator('[class*="SidePanel"]').filter({ hasText: /Team/i })`

**Team side panel actions:**

| Action | Locator |
|--------|---------|
| Bearbeiten | `button(page, /Bearbeiten/i)` |
| Löschen | `button(page, /Loeschen/i)` |
| Benutzer hinzufügen | `button(page, /Benutzer hinzufuegen/i)` |
| Benutzer suchen oder auswählen | `page.getByLabel(/Benutzer suchen oder auswaehlen/i)` |
| Nur Benutzer ohne Team | `checkbox(page, /nur Benutzer ohne Team anzeigen/i)` |

**Team form fields:**

| Field | Locator |
|-------|---------|
| Teambezeichnung | `page.getByLabel(/Teambezeichnung/i)` |

### Organizations List

- **Table locator:** `page.locator('table, [role="table"], [class*="Organizations"], [class*="Table"]').first()`
- **Organization side panel:** `page.locator('[class*="SidePanel"]').filter({ hasText: /Organisation/i })`

### Benutzerverwaltung Modals (from inspection + locator library)

| Modal | Trigger | Fields | Buttons |
|-------|---------|--------|---------|
| Team erstellen | "Team erstellen" button | Organisation (Network Nord), Teambezeichnung | Abbrechen, Erstellen |
| Benutzer erstellen | "Benutzer erstellen" button | Benutzername, Vorname, Nachname, E-Mail, Organisation | wizard-based |
| Admin A1 erstellen | "Admin A1 erstellen" button | similar to Benutzer erstellen | wizard-based |
| Benutzer aktivieren | UserPanel action | confirmation | Aktivieren, Abbrechen |
| Benutzer deaktivieren | UserPanel action | confirmation | Deaktivieren, Abbrechen |
| Benutzer löschen | UserPanel delete action | confirmation | Benutzer behalten, Löschen |
| Team löschen | TeamPanel delete action | confirmation | Team behalten, Löschen |

**Team erstellen modal detail (captured):**
- **Trigger:** `page.getByRole('button', { name: 'Team erstellen' })`
- **Close:** × button or Escape
- **Fields:** Organisation dropdown (pre-filled: Network Nord), Teambezeichnung text input
- **Buttons:** Abbrechen, Erstellen
- **Modal locator:** `page.getByRole('dialog')`

---

## Importe

**URL:** `https://portal-int.open-frontends.a1.net/door2door#/importe`  
**Inspected:** 2026-06-20  
**Button count:** 38  
**Modals:** 0 captured (import wizard modal known from locator library)  
**Side panels:** 0  

The Importe page shows an import protocol log and provides actions to import new data or change the organization context. Pagination shows 25 rows per page with 21 "Rückgängig machen" (undo) row actions visible in the list.

### Search Field

- Input ID: `imports-search-field` (type: text)
- Playwright locator: `page.getByPlaceholder(/Suche in Importe/i)`

### Importe Action Row Buttons

| Button | Safety Class | Locator | Purpose |
|--------|-------------|---------|---------|
| Organisation wechseln | UNKNOWN | `page.getByRole('button', { name: 'Organisation wechseln' })` | Opens ChangeContractSectionsOrganization modal |
| Daten importieren | RISKY_DATA_CHANGE | `page.getByRole('button', { name: 'Daten importieren' })` | Opens ImportObjectsModal wizard |

### Importe Filter Bar

| Filter | Locator | Purpose |
|--------|---------|---------|
| System Import | `page.getByRole('button', { name: 'System Import' })` | Filter by import type |
| Datei Import | `page.getByRole('button', { name: 'Datei Import' })` | Filter by import type |
| Importdatum | `page.getByRole('button', { name: 'Importdatum' })` | Filter by date |
| Organisation | `page.getByRole('button', { name: 'Organisation' })` | Filter by org |
| Benutzer | `page.getByRole('button', { name: 'Benutzer' })` | Filter by user |

### Importe Table

- **Table locator:** `page.locator('table, [role="table"], [class*="ImportsTable"], [class*="Table"]').first()`
- **Row by text:** `page.locator('tr, [role="row"]').filter({ hasText: text })`

### Importe Row Actions

Each row in the import log has a "Rückgängig machen" (undo/revert) button:

- **Locator:** `page.getByRole('button', { name: 'Rückgängig machen' })`
- This opens a RevertConfirmModal with options to cancel or confirm deletion of imported data.

### Importe Modals (from locator library)

| Modal | Trigger | Purpose |
|-------|---------|---------|
| ImportObjectsModal | "Daten importieren" | Multi-step import wizard; includes file dropzone, org selection |
| ChangeContractSectionsOrganization | "Organisation wechseln" | Changes organization context for contract sections |
| RevertConfirmModal | "Rückgängig machen" per row | Confirms or cancels import rollback |

**Import wizard buttons (from locator library):**

| Button | Locator | Purpose |
|--------|---------|---------|
| Weiter / Import starten / Importieren | `button(page, /Weiter|Import starten|Importieren/i)` | Advance wizard step |
| Zurück zur Auswahl | `button(page, /Zurueck zur Auswahl/i)` | Back to previous step |
| Import abbrechen | `button(page, /Import abbrechen/i)` | Cancel and close wizard |
| Import fortsetzen | `button(page, /Import fortsetzen/i)` | Return to wizard after cancel prompt |
| Import neu starten | `button(page, /Import neu starten/i)` | Restart wizard from error/success state |

**File dropzone:**
- **Locator:** `page.locator('[class*="FileUploader"], input[type="file"]').first()`
- **Purpose:** Upload CSV/import file in wizard upload step

---

## Konfiguration

**URL:** `https://portal-int.open-frontends.a1.net/door2door#/konfiguration/%C3%BCbersicht`  
**Inspected:** 2026-06-20  
**Button count:** 0 (Übersicht/overview section had no interactive buttons)  
**Modals:** 0  
**Side panels:** 0  

The Konfiguration page has a vertical left-side navigation with six sub-sections. It is an admin-only area.

### Konfiguration Navigation (Vertical)

| Section | Route | Nav Locator |
|---------|-------|-------------|
| Übersicht | `#/konfiguration/uebersicht` | `link(page, /uebersicht/i)` |
| Abschlussgründe | `#/konfiguration/abschlussgruende` | `link(page, /abschlussgruende/i)` |
| Aufgaben | `#/konfiguration/aufgaben` | `link(page, /aufgaben/i)` |
| Gruppen | `#/konfiguration/gruppen` | `link(page, /gruppen/i)` |
| Regime | `#/konfiguration/regime` | `link(page, /regime/i)` |
| Aktivitäten-Setup | `#/konfiguration/aktivitaeten-setup` | `link(page, /aktivitaeten-setup/i)` |

### Übersicht (Overview)

- **List section:** "Übersicht" (0 items at inspection)
- **No buttons or modals** captured in this inspection snapshot

### Abschlussgründe (Interaction Outcomes)

- **Search:** `page.getByPlaceholder(/Suche in Abschluss/i)`
- **Create button:** `button(page, /Abschlussgruende erstellen/i)` → opens CreateInteractionOutcomeModal
- **Table:** `page.locator('table, [role="table"], [class*="Table"]').first()`
- **Form fields:** Display Text `page.getByLabel(/Display Text|Anzeigename|Abschluss/i)`, Key `page.getByLabel(/Key|Schluessel/i)`

### Aufgaben (Tasks)

- **Search:** `page.getByPlaceholder(/Suche in Aufgaben/i)`
- **Create button:** `button(page, /Aufgabe erstellen/i)` → opens CreateSaTaskModal
- **Table:** `page.locator('table, [role="table"], [class*="Table"]').first()`
- **Form fields:** Aufgabe/Task name `page.getByLabel(/Aufgabe|Task/i)`

### Gruppen (Groups)

- **Table:** `page.locator('table, [role="table"], [class*="Table"]').first()`
- Interaction group setup table — create/edit functionality available via row context menu

### Regime

- **Search:** `page.getByPlaceholder(/Suche in Regime/i)`
- **Create button:** `button(page, /Regime erstellen/i)` → opens CreateRegimeModal
- **Table:** `page.locator('table, [role="table"], [class*="Table"]').first()`
- **Form fields:** Regime name `page.getByLabel(/Regime/i)`

### Aktivitäten-Setup (Interaction Sections)

- **Create button:** `button(page, /Aktivitaet|Section|Bereich|erstellen/i)` — creates interaction section entry
- **Table:** `page.locator('table, [role="table"], [class*="Table"]').first()`

### Konfiguration Row Operations

All configuration tables share the same row patterns:

```typescript
configuration(page).rowByText(text)       // find row by visible text
configuration(page).rowContextMenu(text)  // last button in row = edit/delete menu
```

---

## Modals (Complete Inventory)

### Captured in DOM Inspection

| Modal | Page | Trigger | Fields | Close Method |
|-------|------|---------|--------|--------------|
| Alle Filter | Objekte | "alle Filter" button | Übergabestatus (nicht übergeben / zurückgewiesen / übergeben), Baulos/Einsatzname search, PLZ (Bereich / exakt), Organisation (Network Nord, NMAV NÖ 1, NMAV NÖ 2), Verkaufsstart-Termin (8 Tage / 6 Wochen), Fragebogen (vollständig / unvollständig) | × button, "Alle Filter entfernen", Escape |
| Alle Filter | Sales Action | "alle Filter" button | Same as Objekte Alle Filter | × button, "Alle Filter entfernen", Escape |
| Team erstellen | Benutzerverwaltung | "Team erstellen" button | Organisation (pre-filled: Network Nord), Teambezeichnung | × button, Escape |

### Known from Locator Library (Not Captured)

| Modal | Trigger Page | Purpose |
|-------|-------------|---------|
| Benutzer erstellen | Benutzerverwaltung | Create user wizard |
| Admin A1 erstellen | Benutzerverwaltung | Create A1 admin wizard |
| Benutzer aktivieren | UserPanel | Confirm user activation |
| Benutzer deaktivieren | UserPanel | Confirm user deactivation |
| Benutzer löschen | UserPanel | Confirm user deletion |
| Team löschen | TeamPanel | Confirm team deletion |
| ImportObjectsModal | Importe | Multi-step import wizard with file upload |
| ChangeContractSectionsOrganization | Importe | Change organization context |
| RevertConfirmModal | Importe (per row) | Confirm import rollback |
| CaptureActivityModal | SalesActionPanel | Record customer interaction/activity |
| CaptureContractModal | SalesActionPanel | Sales/order capture flow |
| DeleteSalesAction | SalesActionPanel | Confirm sales action deletion |
| DeleteDocument | SalesActionPanel documents tab | Confirm document deletion |
| AllFiltersModal | Objekte / Sales Actions | Full filter configuration |

**Universal modal locator pattern:**
```typescript
page.getByRole('dialog')                    // any open dialog
dialog(page).filter({ hasText: /keyword/i }) // scoped by content
dialog(page).locator('button').filter({ hasText: /^$/ }).first() // close icon (fragile)
```

---

## Side Panels (Complete Inventory)

Side panels were not directly captured in the DOM inspection run, but are documented in the Playwright locator library. All side panels use generated CSS class names as their primary locator — a known stability risk.

| Side Panel | Page | How to Open | Panel Locator | Notes |
|------------|------|------------|---------------|-------|
| Object Details | Objekte | Click a table row | `page.locator('[class*="SidePanel"]').filter({ hasText: /OBJEKT:/i })` | 4 tabs: Übersicht, Fragebogen (Neubau), D2D Verkauf, Objekt SA (Neubau) |
| Sales Action Details | Sales Actions | Click a table row | `page.locator('[class*="SidePanel"]').first()` | 4–6 tabs depending on type |
| User Details | Benutzerverwaltung → Users tab | Click a user row | `page.locator('[class*="SidePanel"]').filter({ hasText: /Benutzer|User/i })` | 2 tabs: Benutzerdaten, Rollen/Teams |
| Team Details | Benutzerverwaltung → Teams tab | Click a team row | `page.locator('[class*="SidePanel"]').filter({ hasText: /Team/i })` | Team management + user assignment |
| Organization Details | Benutzerverwaltung → Organisationen tab | Click an org row | `page.locator('[class*="SidePanel"]').filter({ hasText: /Organisation/i })` | Read-only organization details |

**Universal side panel close:**
```typescript
page.locator('[class*="SidePanel"]').getByRole('button').first()
// Note: This is fragile — relies on the first button being the close button
```

---

## Common Patterns Across All Pages

### Pagination (All List Pages)

```typescript
page.getByRole('button', { name: '25' })    // page size selector
page.getByRole('button', { name: '1' })     // page number
button(page, /weiter|next|naechste/i)       // next page
button(page, /zurueck|zuruck|previous/i)    // previous page
```

### Table / Row Pattern

```typescript
page.locator('table, [role="table"], [class*="Table"]').first()   // table
page.locator('tbody tr, [role="row"]')                            // all rows
page.locator('tr, [role="row"]').filter({ hasText: text })        // specific row
row.locator('button').last()                                       // context menu (fragile)
```

### Toast / Error States

```typescript
page.locator('[class*="Toast"], [role="alert"], [role="status"]').first()  // toast
page.getByText('Technischer Fehler')                                        // tech error
page.getByText('Missing Permissions')                                        // permission error
```

### Search Fields (by page)

| Page | Input ID | Locator |
|------|---------|---------|
| Baulose | `baulose-search-field` | `page.getByPlaceholder(/Suche nach Baulose\/Einsatznamen/i)` |
| Objekte | `objects-search-field` | `page.locator('input[placeholder*="Suche"]').first()` |
| Sales Actions | `objects-search-field` | `page.locator('input[placeholder*="Suche"]').first()` |
| Benutzerverwaltung | `shared-search-field` | (no explicit placeholder locator in library) |
| Importe | `imports-search-field` | `page.getByPlaceholder(/Suche in Importe/i)` |
| Konfiguration → Aufgaben | — | `page.getByPlaceholder(/Suche in Aufgaben/i)` |
| Konfiguration → Regime | — | `page.getByPlaceholder(/Suche in Regime/i)` |
| Konfiguration → Abschlussgründe | — | `page.getByPlaceholder(/Suche in Abschluss/i)` |
