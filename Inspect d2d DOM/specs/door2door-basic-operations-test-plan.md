# Door 2 Door Basic Operations Test Plan

## Application Overview

Basic operational test plan for the Door 2 Door application opened at the configuration overview page. Covers navigation, key page access, filter visibility, action buttons, and session controls for the main SPA sections.

## Test Scenarios

### 1. Door 2 Door Basic Operations

**Seed:** `seed.spec.ts`

#### 1.1. Verify main application navigation

**File:** `specs/door2door-basic-operations-test-plan.md`

**Steps:**
  1. Ensure the app is opened at the current URL.
    - expect: The browser URL includes #/konfiguration/übersicht and page title is Door 2 Door.
  2. Verify the top navigation contains Home, Door 2 Door, Timey, Cockpit-Leistungspositionen, Case Comments, Case Document Viewer, and Address List.
    - expect: All top navigation labels are displayed and clickable.
  3. Verify the in-app sidebar contains Baulose, Objekte, Sales Action, Benutzerverwaltung, Importe, and Konfiguration.
    - expect: All sidebar navigation links are present and mapped to the app.

#### 1.2. Validate Baulose page basic operations

**File:** `specs/door2door-basic-operations-test-plan.md`

**Steps:**
  1. Click the Baulose sidebar link.
    - expect: The URL navigates to #/baulose and the page renders a Baulose list view.
  2. Locate the Baulose search field and filter controls.
    - expect: A search input labeled Suche nach Baulose/Einsatznamen... is visible.
    - expect: Filter labels Organisation, Regime, Phase, and Status are present.
  3. Verify tab counts for item categories.
    - expect: FTTH-AUSBAU and BESTANDSBAU tabs are displayed with counts.
  4. Verify pagination controls are visible.
    - expect: Page size options such as 25 and page number controls are displayed.

#### 1.3. Validate Objekte page basic operations

**File:** `specs/door2door-basic-operations-test-plan.md`

**Steps:**
  1. Click the Objekte sidebar link.
    - expect: The URL navigates to #/objekte and the objects list view loads.
  2. Confirm the search label and object filters are visible.
    - expect: Search in Objekte... field is present.
    - expect: Filter labels including alle Filter, nicht übergeben, zurückgewiesen, übergeben, Baulos/Einsatzname, PLZ, Organisation, Verkaufsstart, and Fragebogen are visible.
  3. Validate tabs and object rows load.
    - expect: NEUBAU, FTTH-AUSBAU, and BESTANDSBAU tabs appear with counts.
    - expect: At least one item row is displayed with address text and detail link.

#### 1.4. Validate Sales Actions page basic operations

**File:** `specs/door2door-basic-operations-test-plan.md`

**Steps:**
  1. Click the Sales Action sidebar link.
    - expect: The URL navigates to #/sales-actions and the sales action list loads.
  2. Verify the Sales Actions search and filters are present.
    - expect: Search in Sales Actions... field is visible.
    - expect: Filter labels including Baulos/Einsatzname, Organisation, Regime, Phase, Termin, Immobilienart, Status, Aufgabe, Ergebnis, Planskizze, Bestellung über D2D, Ableger Zustimmung, Kundendaten, Sales Action-Type, Objekt, zugewiesen an, and upselling Potential are visible.
  3. Confirm sales action tabs or item categories are displayed.
    - expect: NEUBAU, FTTH-AUSBAU, and BESTANDSBAU population labels are visible.

#### 1.5. Validate Benutzerverwaltung page basic operations

**File:** `specs/door2door-basic-operations-test-plan.md`

**Steps:**
  1. Click the Benutzerverwaltung sidebar link.
    - expect: The URL navigates to #/benutzerverwaltung/users and the user management page loads.
  2. Verify user management actions are available.
    - expect: Buttons Benutzer erstellen, Team erstellen, and Admin A1 erstellen are visible.
  3. Verify user filters and counts are displayed.
    - expect: Filter labels aktiv, inaktiv, ohne Rolle, Organisation, and Rolle are present.
    - expect: Counters BENUTZER, TEAMS, and ORGANISATIONEN are shown.

#### 1.6. Validate Importe page basic operations

**File:** `specs/door2door-basic-operations-test-plan.md`

**Steps:**
  1. Click the Importe sidebar link.
    - expect: The URL navigates to #/importe and the import page loads.
  2. Verify import controls are visible.
    - expect: Buttons or links Organisation wechseln and Daten importieren are present.
    - expect: Tabs System Import and Datei Import are displayed.
  3. Confirm import metadata fields are shown.
    - expect: Labels or fields for Importdatum, Organisation, Benutzer, and Rückgängig machen are visible.

#### 1.7. Validate Konfiguration page basic operations

**File:** `specs/door2door-basic-operations-test-plan.md`

**Steps:**
  1. On the current page, confirm the configuration overview header is visible.
    - expect: Heading Übersicht is displayed.
  2. Verify the configuration tabs are present.
    - expect: Links for Übersicht, Abschlussgründe, Aufgaben, Gruppen, Regime, and Aktivitäten Setup are visible and clickable.

#### 1.8. Verify session expiration and auth controls

**File:** `specs/door2door-basic-operations-test-plan.md`

**Steps:**
  1. Locate the session expiration warning area.
    - expect: Text indicating authentication will expire is displayed.
  2. Verify the Extend authentication control is available.
    - expect: The Extend authentication link or button is visible and actionable.
