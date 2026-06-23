# Door 2 Door Basic Operations Test Plan

## Application Overview

The Door 2 Door application is a comprehensive management system for handling construction projects, real estate objects, and sales operations. This test plan covers basic operational flows including navigation, page access, filtering, searching, tab switching, and data presentation across all main sections: Baulose (Construction Lots), Objekte (Objects), Sales Actions, Benutzerverwaltung (User Management), Importe (Imports), and Konfiguration (Configuration).

## Test Scenarios

### 1. Navigation and Page Access

**Seed:** `seed.spec.ts`

#### 1.1. Verify main application navigation and layout

**File:** `tests/navigation/navigation.spec.ts`

**Steps:**
  1. Open the Door 2 Door application at the base URL
    - expect: The page title shows 'Door 2 Door'
    - expect: The URL contains '#/objekte' or navigates to a default page
    - expect: The main navigation banner is visible at the top
  2. Verify the top navigation bar contains all external links
    - expect: Link 'Home' is visible and clickable
    - expect: Link 'Timey' is visible and clickable
    - expect: Link 'Cockpit-Leistungspositionen' is visible and clickable
    - expect: Link 'Case Comments' is visible and clickable
    - expect: Link 'Case Document Viewer' is visible and clickable
    - expect: Link 'Address List' is visible and clickable
  3. Verify the sidebar navigation contains all main sections
    - expect: Sidebar link 'Baulose' is displayed
    - expect: Sidebar link 'Objekte' is displayed
    - expect: Sidebar link 'Sales Action' is displayed
    - expect: Sidebar link 'Benutzerverwaltung' is displayed
    - expect: Sidebar link 'Importe' is displayed
    - expect: Sidebar link 'Konfiguration' is displayed
  4. Verify user information is displayed in the header
    - expect: Current username is visible in the header
    - expect: Current organization name is visible in the header
    - expect: Environment indicator shows 'integration' or appropriate environment

#### 1.2. Navigate to Baulose section

**File:** `tests/navigation/baulose-navigation.spec.ts`

**Steps:**
  1. Click on 'Baulose' in the sidebar navigation
    - expect: The URL changes to '#/baulose'
    - expect: The page loads the Baulose list view
    - expect: Tab navigation becomes visible with FTTH and BESTANDSBAU tabs
  2. Verify the Baulose page header and search elements
    - expect: Search field with placeholder 'Suche nach Baulose/Einsatznamen...' is visible
    - expect: Filter button 'alle Filter' is visible
    - expect: Filter buttons for status (if present) are visible
  3. Verify tabs display with item counts
    - expect: FTTH tab is clickable and displays a count
    - expect: BESTANDSBAU tab is clickable and displays a count

#### 1.3. Navigate to Objekte section

**File:** `tests/navigation/objekte-navigation.spec.ts`

**Steps:**
  1. Click on 'Objekte' in the sidebar navigation
    - expect: The URL changes to '#/objekte'
    - expect: The page loads the Objekte (Objects) list view
    - expect: Tab navigation becomes visible
  2. Verify the Objekte page displays all required tabs
    - expect: NEUBAU tab is visible with item count
    - expect: FTTH-AUSBAU tab is visible with item count
    - expect: BESTANDSBAU tab is visible with item count
  3. Verify the search and filter controls are present
    - expect: Search field with placeholder 'Suche in Objekte...' is visible
    - expect: Filter button 'alle Filter' is visible

#### 1.4. Navigate to Sales Actions section

**File:** `tests/navigation/sales-actions-navigation.spec.ts`

**Steps:**
  1. Click on 'Sales Action' in the sidebar navigation
    - expect: The URL changes to '#/sales-actions'
    - expect: The page loads the Sales Actions list view
  2. Verify Sales Actions tabs are displayed
    - expect: NEUBAU tab is visible with item count
    - expect: FTTH-AUSBAU tab is visible with item count
    - expect: BESTANDSBAU tab is visible with item count

#### 1.5. Navigate to Benutzerverwaltung section

**File:** `tests/navigation/user-management-navigation.spec.ts`

**Steps:**
  1. Click on 'Benutzerverwaltung' in the sidebar navigation
    - expect: The URL changes to '#/benutzerverwaltung/users'
    - expect: The User Management page loads with Users tab active
  2. Verify user management tabs and controls
    - expect: Users management section is visible
    - expect: Filter controls are present

#### 1.6. Navigate to Importe section

**File:** `tests/navigation/imports-navigation.spec.ts`

**Steps:**
  1. Click on 'Importe' in the sidebar navigation
    - expect: The URL changes to '#/importe'
    - expect: The Imports page loads
  2. Verify imports page elements are displayed
    - expect: Import controls are visible
    - expect: Import status information is displayed

#### 1.7. Navigate to Konfiguration section

**File:** `tests/navigation/configuration-navigation.spec.ts`

**Steps:**
  1. Click on 'Konfiguration' in the sidebar navigation
    - expect: The URL changes to '#/konfiguration' or '#/konfiguration/übersicht'
    - expect: The Configuration page loads
  2. Verify configuration section is accessible
    - expect: Configuration overview or content is displayed
    - expect: Navigation within configuration is available if applicable

### 2. Search and Filter Operations

**Seed:** `seed.spec.ts`

#### 2.1. Search functionality in Objekte page

**File:** `tests/search-filter/objekte-search.spec.ts`

**Steps:**
  1. Navigate to Objekte page
    - expect: Objekte page is displayed with object list
  2. Click on the search field and enter search text
    - expect: Search field is focused and accepts input
    - expect: Search text can be entered without errors
  3. Verify search results are filtered or results update
    - expect: Table updates to reflect search criteria (if implementation supports real-time search)
    - expect: Results contain objects matching the search criteria or search completes without errors
  4. Clear the search field
    - expect: Search field is cleared
    - expect: List reverts to showing all items or default state

#### 2.2. Filter operations on Objekte page

**File:** `tests/search-filter/objekte-filters.spec.ts`

**Steps:**
  1. Click on 'alle Filter' button
    - expect: Filter modal or filter panel opens
    - expect: Available filter options are displayed
  2. Verify available filter categories are present
    - expect: Filter options like 'Baulos/Einsatzname', 'PLZ', 'Organisation', 'Verkaufsstart', 'Fragebogen' are visible
  3. Select a filter option
    - expect: Filter can be selected without errors
    - expect: Modal or panel updates to show selected filters
  4. Apply the filter
    - expect: Filter is applied to the list
    - expect: Results update to show only items matching the filter criteria
  5. Clear filters
    - expect: Filter clear option is available
    - expect: Filters are removed and full list is displayed again

#### 2.3. Quick filter buttons in Objekte page

**File:** `tests/search-filter/objekte-quick-filters.spec.ts`

**Steps:**
  1. Navigate to Objekte page
    - expect: Objekte page is displayed
  2. Verify quick filter buttons are visible
    - expect: Quick filter buttons like 'nicht übergeben', 'zurückgewiesen', 'übergeben' are displayed
  3. Click on a quick filter button
    - expect: Quick filter is applied
    - expect: List is filtered to show only items matching that filter
  4. Click on another quick filter button
    - expect: Previous filter is replaced or combined with new filter (depends on implementation)
    - expect: List updates accordingly

### 3. Tab Switching and Data Display

**Seed:** `seed.spec.ts`

#### 3.1. Tab switching in Objekte page

**File:** `tests/tabs-data/objekte-tabs.spec.ts`

**Steps:**
  1. Navigate to Objekte page
    - expect: Objekte page displays with default tab (usually NEUBAU)
  2. Click on 'FTTH-AUSBAU' tab
    - expect: URL updates to '#/objekte/ftth'
    - expect: Tab becomes active/highlighted
    - expect: Table content switches to show FTTH-AUSBAU objects
    - expect: Item count updates to reflect FTTH objects
  3. Click on 'BESTANDSBAU' tab
    - expect: URL updates to '#/objekte/bestandsbau'
    - expect: Tab becomes active/highlighted
    - expect: Table content switches to show BESTANDSBAU objects
    - expect: Item count updates to reflect BESTANDSBAU objects
  4. Click back to 'NEUBAU' tab
    - expect: URL updates to '#/objekte/neubau'
    - expect: Tab becomes active/highlighted
    - expect: Table content switches back to NEUBAU objects

#### 3.2. Tab switching in Baulose page

**File:** `tests/tabs-data/baulose-tabs.spec.ts`

**Steps:**
  1. Navigate to Baulose page
    - expect: Baulose page displays with default tab
  2. Click on 'FTTH' tab
    - expect: URL updates to '#/baulose/ftth'
    - expect: Tab becomes active
    - expect: List updates to show FTTH Baulose items
  3. Click on 'BESTANDSBAU' tab
    - expect: URL updates to '#/baulose/bestandsbau'
    - expect: Tab becomes active
    - expect: List updates to show BESTANDSBAU Baulose items

#### 3.3. Tab switching in Sales Actions page

**File:** `tests/tabs-data/sales-actions-tabs.spec.ts`

**Steps:**
  1. Navigate to Sales Actions page
    - expect: Sales Actions page displays with tabs
  2. Verify all three tabs are visible and clickable
    - expect: NEUBAU tab with count is visible
    - expect: FTTH-AUSBAU tab with count is visible
    - expect: BESTANDSBAU tab with count is visible
  3. Switch between tabs
    - expect: Each tab click updates the URL appropriately
    - expect: Content updates to reflect selected tab

#### 3.4. Table data display in list pages

**File:** `tests/tabs-data/table-display.spec.ts`

**Steps:**
  1. Navigate to Objekte page
    - expect: Table is displayed with object data
  2. Verify table has proper column headers
    - expect: Column headers are visible and readable
    - expect: Headers include expected columns like 'Objekt', 'Subtyp', 'Organisation', etc.
  3. Verify table rows contain data
    - expect: At least one row of data is displayed
    - expect: Object addresses and information are populated in rows
  4. Click on an object address link in a table row
    - expect: Object detail view or side panel opens
    - expect: URL changes to include object ID (e.g., '#/objekte/neubau/{id}')
    - expect: Object details are displayed without errors

### 4. User Management Operations

**Seed:** `seed.spec.ts`

#### 4.1. Access User Management page

**File:** `tests/user-management/access-user-management.spec.ts`

**Steps:**
  1. Navigate to Benutzerverwaltung page
    - expect: User Management page loads successfully
    - expect: URL shows '#/benutzerverwaltung/users'
  2. Verify user list is displayed
    - expect: User list or table is visible
    - expect: User information is displayed with appropriate columns
  3. Verify action buttons are present
    - expect: 'Benutzer erstellen' button is visible
    - expect: Other management buttons are visible as applicable

#### 4.2. User Management filters and sorting

**File:** `tests/user-management/user-filters.spec.ts`

**Steps:**
  1. Navigate to User Management page
    - expect: User Management page is displayed
  2. Verify filter options are available
    - expect: Filter buttons like 'aktiv', 'inaktiv' are visible
    - expect: Additional filter categories like 'Organisation', 'Rolle' are available
  3. Apply a filter (e.g., 'aktiv')
    - expect: Filter is applied to the user list
    - expect: List displays only active users
  4. Verify counter badges update
    - expect: Counters for 'BENUTZER', 'TEAMS', 'ORGANISATIONEN' are displayed
    - expect: Counters reflect the current filtered state

### 5. Configuration and System Operations

**Seed:** `seed.spec.ts`

#### 5.1. Access Configuration page

**File:** `tests/configuration/access-configuration.spec.ts`

**Steps:**
  1. Click on 'Konfiguration' in sidebar navigation
    - expect: Configuration page loads
    - expect: URL changes to '#/konfiguration/übersicht' or appropriate configuration route
  2. Verify configuration overview is displayed
    - expect: Configuration header or title is visible
    - expect: Configuration content is rendered without errors

#### 5.2. Verify environment and version information

**File:** `tests/configuration/system-info.spec.ts`

**Steps:**
  1. Check the banner at the top of the page
    - expect: 'Environment: integration' text is visible
    - expect: Portal Version is displayed (e.g., '1.28.30')
  2. Verify 'Widget Versions' link is accessible
    - expect: 'Widget Versions' link is visible in the header
    - expect: Link is clickable without errors
  3. Verify current user information
    - expect: Current user name is displayed
    - expect: Current organization is displayed in header area

### 6. Error Handling and Edge Cases

**Seed:** `seed.spec.ts`

#### 6.1. Handle navigation to non-existent object ID

**File:** `tests/error-handling/invalid-object-id.spec.ts`

**Steps:**
  1. Navigate directly to an object detail page with an invalid ID (e.g., '#/objekte/neubau/999999999')
    - expect: Application handles the error gracefully
    - expect: Either shows an error message or redirects to the list page

#### 6.2. Handle slow network conditions

**File:** `tests/error-handling/loading-states.spec.ts`

**Steps:**
  1. Navigate to a page and observe loading states
    - expect: Loading indicators or placeholders are shown while data loads
    - expect: Page eventually displays data or appropriate error message
  2. Verify toast messages display correctly
    - expect: Success or error toast notifications appear when appropriate
    - expect: Toast messages are readable and positioned correctly

#### 6.3. Verify permission restrictions

**File:** `tests/error-handling/permissions.spec.ts`

**Steps:**
  1. Attempt to access admin-only sections if not authorized
    - expect: Access is restricted appropriately
    - expect: 'Missing Permissions' message displays if applicable
    - expect: User is redirected or prevented from accessing restricted content

### 7. Responsive and UI Consistency

**Seed:** `seed.spec.ts`

#### 7.1. Verify UI consistency across pages

**File:** `tests/ui-consistency/consistent-layout.spec.ts`

**Steps:**
  1. Navigate through different pages (Baulose, Objekte, Sales Actions, etc.)
    - expect: Header navigation remains consistent across all pages
    - expect: Sidebar navigation is consistently positioned
    - expect: Overall layout structure is maintained
  2. Verify consistent styling of buttons and controls
    - expect: Button styles are consistent across the application
    - expect: Filter controls follow the same design pattern
    - expect: Table styles are consistent in all list pages

#### 7.2. Verify keyboard navigation

**File:** `tests/ui-consistency/keyboard-navigation.spec.ts`

**Steps:**
  1. Navigate using Tab key to cycle through interactive elements
    - expect: Tab key moves focus through interactive elements
    - expect: Focus indicators are visible
    - expect: All interactive elements are reachable via keyboard
  2. Use Enter key to activate buttons and links
    - expect: Enter key activates focused buttons
    - expect: Enter key activates focused links
    - expect: Navigation works as expected
