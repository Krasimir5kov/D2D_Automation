# Door 2 Door Basic Operations Test Plan

## Application Overview

Basic end-to-end coverage for the Door 2 Door integration app, focusing on the current opened page and primary SPA routes. This plan checks page load, navigation, filter visibility, configuration tabs, and global session controls.

## Test Scenarios

### 1. Core App Interface

**Seed:** `seed.spec.ts`

#### 1.1. Verify app loads and top navigation is visible

**File:** `specs/basic-operations-plan.md`

**Steps:**
  1. -
    - expect: The browser should open the Door 2 Door app at the current URL
    - expect: Page title should be 'Door 2 Door'
    - expect: Top navigation should include Home, Door 2 Door, Timey, Cockpit-Leistungspositionen, Case Comments, Case Document Viewer, and Address List
    - expect: Side menu should include Baulose, Objekte, Sales Action, Benutzerverwaltung, Importe, Konfiguration

#### 1.2. Validate configuration overview page

**File:** `specs/basic-operations-plan.md`

**Steps:**
  1. Open the app at https://portal-int.open-frontends.a1.net/door2door#/konfiguration/übersicht
    - expect: The page should load successfully
    - expect: The heading 'Übersicht' should be visible
    - expect: Configuration tabs should include Übersicht, Abschlussgründe, Aufgaben, Gruppen, Regime, Aktivitäten Setup

#### 1.3. Verify navigation to main SPA pages

**File:** `specs/basic-operations-plan.md`

**Steps:**
  1. Navigate to #/baulose
    - expect: The route should update to /baulose
    - expect: The Baulose page should show search and filter controls such as Suche nach Baulose/Einsatznamen..., Organisation, Regime, Phase, Status
    - expect: Tabs should include FTTH-AUSBAU and BESTANDSBAU
  2. Navigate to #/objekte
    - expect: The route should update to /objekte
    - expect: The Objekte page should show search and filter controls such as Suche in Objekte..., alle Filter, nicht übergeben, zurückgewiesen, übergeben, Baulos/Einsatzname, PLZ, Organisation, Verkaufsstart, Fragebogen
    - expect: Tabs should include NEUBAU, FTTH-AUSBAU, BESTANDSBAU
  3. Navigate to #/sales-actions
    - expect: The route should update to /sales-actions
    - expect: The Sales Actions page should show search and filter controls such as Suche in Sales Actions..., alle Filter, Baulos/Einsatzname, Organisation, Regime, Phase, Termin, Immobilienart, Status, Aufgabe, Ergebnis, Planskizze, Bestellung über D2D, Ableger Zustimmung, Kundendaten, Sales Action-Type, Objekt, zugewiesen an, upselling Potential
    - expect: Page should display sales action item entries
  4. Navigate to #/benutzerverwaltung
    - expect: The route should update to /benutzerverwaltung/users
    - expect: The Benutzerverwaltung page should show actions like Benutzer erstellen, Team erstellen, Admin A1 erstellen
    - expect: User management tabs or counts should include BENUTZER, TEAMS, ORGANISATIONEN
  5. Navigate to #/importe
    - expect: The route should update to /importe
    - expect: The Importe page should show actions like Organisation wechseln and Daten importieren
    - expect: Import tabs should include System Import and Datei Import
    - expect: Fields such as Importdatum, Organisation, Benutzer, Rückgängig machen should be visible

#### 1.4. Check global session controls

**File:** `specs/basic-operations-plan.md`

**Steps:**
  1. -
    - expect: The app should display Extend authentication
    - expect: The app should display Abmelden link
    - expect: The A1 Telekom Austria Group footer link should be present
