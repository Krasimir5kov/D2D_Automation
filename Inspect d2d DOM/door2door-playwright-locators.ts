import type { Locator, Page } from '@playwright/test';

type LocatorGroup = Record<string, Locator | ((...args: any[]) => Locator)>;

const exact = (text: string): RegExp => new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
// Used for exact visible names in header/menu buttons, matching the full text.
const contains = (text: string): RegExp => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
// Used for labels where the FE can add prefixes/suffixes, especially filter fields.

const button = (page: Page, name: string | RegExp): Locator => page.getByRole('button', { name });
// Shared helper for Gucci Button / GucciLinkButton controls rendered as accessible buttons.
const link = (page: Page, name: string | RegExp): Locator => page.getByRole('link', { name });
// Shared helper for React Router Link / NavLink navigation entries.
const tab = (page: Page, name: string | RegExp): Locator => page.getByRole('tab', { name });
// Shared helper for Gucci tab panels where the library exposes role="tab".
const checkbox = (page: Page, name: string | RegExp): Locator => page.getByRole('checkbox', { name });
// Shared helper for checkbox filters, bulk selection checkboxes, and form toggles.
const dialog = (page: Page, name?: string | RegExp): Locator =>
  name ? page.getByRole('dialog', { name }) : page.getByRole('dialog');
// Shared helper for ModalDialog instances opened by create/import/delete/edit buttons.

export const door2doorRoutes = {
  baulose: '/baulose',
  // Header route: opens the Baulose list page with FTTH/Bestandsbau tabs and search.
  objects: '/objekte',
  // Header route: opens the Objects table; clicking rows opens the Object side panel.
  salesActions: '/sales-actions',
  // Header route: opens Sales Action lists; clicking rows opens the Sales Action side panel.
  userAdministration: '/benutzerverwaltung',
  // Header route: opens Users/Teams/Organizations administration tabs.
  imports: '/importe',
  // Header route: opens import protocol list and import/change-organization actions.
  configuration: '/konfiguration',
  // Header route: opens the configuration area with vertical navigation.
  configurationOverview: '/konfiguration/uebersicht',
  // Configuration child route: overview/information section.
  configurationInteractionOutcomes: '/konfiguration/abschlussgruende',
  // Configuration child route: list/detail pages for interaction outcome closing reasons.
  configurationTasks: '/konfiguration/aufgaben',
  // Configuration child route: Sales Action task configuration list and create modal.
  configurationGroups: '/konfiguration/gruppen',
  // Configuration child route: interaction group setup table.
  configurationRegime: '/konfiguration/regime',
  // Configuration child route: regime list and create modal.
  configurationInteractionSections: '/konfiguration/aktivitaeten-setup'
  // Configuration child route: interaction section/activity setup table.
} as const;

export const door2doorLocators = {
  app(page: Page): LocatorGroup {
    return {
      root: page.locator('#root, [class*="WidgetStyle"]').first(),
      // Location: whole D2D widget root in Widget.tsx. Action: container only; use for app-mounted waits.
      header: page.locator('header, [class*="HeaderStyle"]').first(),
      // Location: top navigation/header in Header.tsx. Action: contains route links and user info.
      currentUser: page.locator('[class*="RightNavigation"]').first(),
      // Location: top-right header block. Action: displays current user's name and organization.
      toast: page.locator('[class*="Toast"], [role="alert"], [role="status"]').first(),
      // Location: global toast area from ToastMessageHandler. Action: shows FE/BF success and error messages.
      loading: page.locator('[class*="Loading"], [class*="Placeholder"]'),
      // Location: any route, table, modal, or side panel. Action: FE loading placeholder while BF requests resolve.
      technicalError: page.getByText('Technischer Fehler'),
      // Location: error Message components across pages. Action: indicates BF/API or FE rendering failure.
      missingPermissions: page.getByText('Missing Permissions')
      // Location: guarded pages when user lacks permissions. Action: static permission failure state.
    };
  },

  navigation(page: Page): LocatorGroup {
    return {
      d2dHomeMark: page.getByText('D2D', { exact: true }),
      // Location: left side of Header. Action: app mark only, not a route action in source.
      baulose: link(page, exact('Baulose')),
      // Location: Header navigation. Action: routes to /baulose.
      objects: link(page, exact('Objekte')),
      // Location: Header navigation. Action: routes to /objekte.
      salesActions: link(page, exact('Sales Action')),
      // Location: Header navigation. Action: routes to /sales-actions.
      userAdministration: link(page, exact('Benutzerverwaltung')),
      // Location: Header navigation. Action: routes to /benutzerverwaltung.
      imports: link(page, exact('Importe')),
      // Location: Header navigation, admin only. Action: routes to /importe.
      configuration: link(page, exact('Konfiguration')),
      // Location: Header navigation, admin only. Action: routes to /konfiguration.
      bookAppointment: button(page, exact('Termin buchen'))
      // Location: Header action button behind LISTENANSICHT_BUTTON_TERMIN_BUCHEN toggle. Action: loads appointment external widget via message bus.
    };
  },

  common(page: Page): LocatorGroup {
    return {
      searchInput: page.locator('input[type="search"], input[placeholder*="Suche"], [role="searchbox"]').first(),
      // Location: list pages and filter modals. Action: enters search text used by FE query/filter state.
      searchButton: button(page, /suche|search/i).first(),
      // Location: SearchField components if rendered with explicit button. Action: submits search.
      clearSearchButton: button(page, /loeschen|\u006c\u00f6schen|clear|zuruecksetzen|zur\u00fccksetzen/i).first(),
      // Location: SearchField/filter controls. Action: clears search/filter state.
      allFilters: button(page, /alle filter/i),
      // Location: filter section on table pages. Action: opens AllFiltersModal.
      clearAllFilters: button(page, /alle filter entfernen|alle filter zuruecksetzen|alle filter zur\u00fccksetzen/i),
      // Location: filter chips/filter summary. Action: removes all active filters.
      reset: button(page, /zuruecksetzen|zur\u00fccksetzen/i),
      // Location: filter dropdowns/modals. Action: resets current selection.
      cancel: button(page, /abbrechen/i),
      // Location: modal footers and edit sections. Action: closes or discards current FE form state.
      apply: button(page, /uebernehmen|\u00fcbernehmen/i),
      // Location: modal/footer edit flows. Action: applies selected form/filter values.
      save: button(page, /speichern/i),
      // Location: edit/create forms. Action: submits data to FE hooks and often BF service mutations.
      close: button(page, /schliessen|schlie\u00dfen/i),
      // Location: success modals and dialogs. Action: closes current modal.
      edit: button(page, /bearbeiten/i),
      // Location: side panels/details. Action: switches section into edit mode or opens edit modal.
      delete: button(page, /loeschen|\u006c\u00f6schen/i),
      // Location: context menus and delete modals. Action: starts delete flow or confirms deletion.
      contextMenu: button(page, /mehr|menu|menue|men\u00fc|options/i).or(page.locator('button[class*="MenuBarPoints"]')),
      // Location: table rows and object/sales-action cards. Action: opens row context menu.
      dialog: dialog(page),
      // Location: any Gucci ModalDialog. Action: generic modal root for waits/assertions.
      modalCloseIcon: dialog(page).locator('button').filter({ hasText: /^$/ }).first(),
      // Location: top-right icon button inside modal dialogs. Action: closes modal when available.
      sidePanel: page.locator('[class*="SidePanel"]').first(),
      // Location: right-side details panel for objects, sales actions, users, teams, organizations.
      sidePanelClose: page.locator('[class*="SidePanel"]').getByRole('button').first(),
      // Location: side panel header. Action: closes side panel by navigating back.
      table: page.locator('table, [role="table"], [class*="Table"]').first(),
      // Location: every list view. Action: table container for rows and cells.
      tableRows: page.locator('tbody tr, [role="row"]'),
      // Location: every data table. Action: selectable/clickable rows depending on route.
      tableCells: page.locator('td, [role="cell"], [role="gridcell"]'),
      // Location: every data table. Action: cell-level assertions.
      paginationNext: button(page, /weiter|next|naechste|n\u00e4chste/i),
      // Location: PageNavigator below paged tables. Action: moves to next page of BF results.
      paginationPrevious: button(page, /zurueck|zur\u00fcck|previous/i)
      // Location: PageNavigator below paged tables. Action: moves to previous page of BF results.
    };
  },

  filters(page: Page): LocatorGroup {
    return {
      filterDropdown: (name: string | RegExp): Locator => button(page, name),
      // Location: filter bar dropdown buttons. Action: opens one named filter menu.
      filterSearchInput: page.locator('input[placeholder*="Filter"], input[placeholder*="Suche"]').first(),
      // Location: filter dropdown search. Action: narrows filter option list client-side.
      filterCheckbox: (name: string | RegExp): Locator => checkbox(page, name),
      // Location: multi/single choice filter lists. Action: toggles one filter option.
      filterFromInput: (label: string): Locator => page.getByLabel(contains(`${label} ab`)),
      // Location: range filter dropdown/modal. Action: sets lower bound.
      filterToInput: (label: string): Locator => page.getByLabel(contains(`${label} bis`)),
      // Location: range filter dropdown/modal. Action: sets upper bound.
      exactValueInput: (label: string): Locator => page.getByLabel(contains(`exakte ${label}`)),
      // Location: numeric range filters. Action: sets exact match value.
      allFiltersModal: dialog(page).filter({ hasText: /Filter/i }),
      // Location: AllFiltersModal. Action: modal root for full filter configuration.
      allFiltersSearch: page.getByPlaceholder(/Suche/i),
      // Location: AllFiltersModal search row. Action: filters available filter categories/options.
      allFiltersApply: button(page, /filter anwenden|anwenden|uebernehmen|\u00fcbernehmen/i),
      // Location: AllFiltersModal footer. Action: applies filters to table query state.
      allFiltersReset: button(page, /filter zuruecksetzen|filter zur\u00fccksetzen|zuruecksetzen|zur\u00fccksetzen/i),
      // Location: AllFiltersModal footer. Action: clears modal filter selections.
      showMore: button(page, /weitere anzeigen/i)
      // Location: long filter option lists. Action: expands hidden filter options.
    };
  },

  baulose(page: Page): LocatorGroup {
    return {
      route: page.locator('body'),
      // Location: /baulose page object. Action: use for route-level navigation/waits.
      searchInput: page.getByPlaceholder(/Suche nach Baulose\/Einsatznamen/i),
      // Location: Baulose top search row. Action: searches baulos/einsatz names.
      ftthTab: link(page, /FTTH/i).or(tab(page, /FTTH/i)),
      // Location: Baulose table-view tabs. Action: switches table to FTTH baulose.
      bestandsbauTab: link(page, /Bestandsbau/i).or(tab(page, /Bestandsbau/i)),
      // Location: Baulose table-view tabs. Action: switches table to Bestandsbau baulose.
      table: page.locator('table, [role="table"], [class*="BaulosTable"], [class*="Table"]').first(),
      // Location: Baulose table area. Action: displays BF baulos results.
      errorMessage: page.getByText('Technischer Fehler')
      // Location: Baulose page Message. Action: appears on BF/API error.
    };
  },

  objects(page: Page): LocatorGroup {
    return {
      searchInput: page.locator('input[placeholder*="Suche"]').first(),
      // Location: /objekte list header. Action: filters object table search query.
      neubauTab: link(page, /Neubau/i).or(tab(page, /Neubau/i)),
      // Location: Objects table tabs. Action: opens Neubau object table.
      ftthTab: link(page, /FTTH/i).or(tab(page, /FTTH/i)),
      // Location: Objects table tabs. Action: opens FTTH object table.
      bestandsbauTab: link(page, /Bestandsbau/i).or(tab(page, /Bestandsbau/i)),
      // Location: Objects table tabs. Action: opens Bestandsbau object table.
      table: page.locator('table, [role="table"], [class*="ObjectTable"], [class*="Table"]').first(),
      // Location: Objects route content. Action: displays object rows from BF.
      rowByText: (text: string | RegExp): Locator => page.locator('tr, [role="row"]').filter({ hasText: text }),
      // Location: Objects table. Action: returns row matching address/object text; click usually opens ObjectPanel.
      rowCheckbox: (text: string | RegExp): Locator =>
        page.locator('tr, [role="row"]').filter({ hasText: text }).getByRole('checkbox'),
      // Location: Objects table row. Action: selects object for bulk action if table supports selection.
      contextMenuInRow: (text: string | RegExp): Locator =>
        page.locator('tr, [role="row"]').filter({ hasText: text }).locator('button').last(),
      // Location: Objects table row menu. Action: opens row-specific actions.
      objectSidePanel: page.locator('[class*="SidePanel"]').filter({ hasText: /OBJEKT:/i }),
      // Location: right-side ObjectPanel. Action: shows selected object details after table row navigation.
      objectInfoTab: link(page, /uebersicht|\u00fcbersicht/i).or(tab(page, /uebersicht|\u00fcbersicht/i)),
      // Location: ObjectPanel tabs. Action: opens overview/info tab.
      questionnaireTab: link(page, /fragebogen/i).or(tab(page, /fragebogen/i)),
      // Location: ObjectPanel tabs for Neubau objects. Action: opens questionnaire tab.
      d2dSalesTab: link(page, /D2D Verkauf/i).or(tab(page, /D2D Verkauf/i)),
      // Location: ObjectPanel tabs. Action: opens associated door-level sales actions.
      objectSalesActionTab: link(page, /Objekt SA/i).or(tab(page, /Objekt SA/i)),
      // Location: ObjectPanel tabs for Neubau objects. Action: opens object-level sales actions.
      editObject: button(page, /bearbeiten/i),
      // Location: Object overview section. Action: enters edit flow for object/status details.
      rejectObject: button(page, /zurueckweisen|zur\u00fcckweisen/i),
      // Location: Object sales execution section. Action: submits rejection status mutation.
      rejectionReason: page.getByLabel(/Begruendung auswaehlen|Begr\u00fcndung ausw\u00e4hlen/i),
      // Location: Object rejection form. Action: selects or types rejection reason.
      addSalesAction: button(page, /Verkaufsstand hinzufuegen|Verkaufsstand hinzuf\u00fcgen/i),
      // Location: ObjectPanel sales action tab. Action: starts creating/generating sales action.
      goToSalesActions: button(page, /zu Sales Actions wechseln/i),
      // Location: ObjectPanel action bar. Action: navigates from object to related Sales Actions route.
      editQuestionnaire: button(page, /Fragebogen bearbeiten/i),
      // Location: Questionnaire tab. Action: switches questionnaire into edit mode.
      saveQuestionnaire: button(page, /Speichern/i),
      // Location: Questionnaire edit footer. Action: saves questionnaire answers through FE hook/BF API.
      editSalesStart: button(page, /Bearbeiten/i),
      // Location: Object sales-start section. Action: opens sales start edit controls.
      salesStartDate: page.getByLabel(/Verkaufsstarttermin/i),
      // Location: EditSaleStart panel. Action: changes sales start date.
      salesStartLocation: page.getByRole('radio', { name: /sales-action-activity-location/i })
      // Location: EditSaleStart radio group. Action: chooses sales-start location option.
    };
  },

  salesActions(page: Page): LocatorGroup {
    return {
      searchInput: page.locator('input[placeholder*="Suche"]').first(),
      // Location: /sales-actions list header. Action: filters sales action table.
      neubauTab: link(page, /Neubau/i).or(tab(page, /Neubau/i)),
      // Location: Sales Action table tabs. Action: opens Neubau sales actions.
      ftthTab: link(page, /FTTH/i).or(tab(page, /FTTH/i)),
      // Location: Sales Action table tabs. Action: opens FTTH sales actions.
      bestandsbauTab: link(page, /Bestandsbau/i).or(tab(page, /Bestandsbau/i)),
      // Location: Sales Action table tabs. Action: opens Bestandsbau sales actions.
      table: page.locator('table, [role="table"], [class*="SalesActionTable"], [class*="Table"]').first(),
      // Location: Sales Action route content. Action: displays BF sales action rows.
      rowByText: (text: string | RegExp): Locator => page.locator('tr, [role="row"]').filter({ hasText: text }),
      // Location: Sales Action table. Action: returns matching row; click usually opens SalesActionPanel.
      rowCheckbox: (text: string | RegExp): Locator =>
        page.locator('tr, [role="row"]').filter({ hasText: text }).getByRole('checkbox'),
      // Location: Sales Action row. Action: selects row for bulk assignment/actions.
      contextMenuInRow: (text: string | RegExp): Locator =>
        page.locator('tr, [role="row"]').filter({ hasText: text }).locator('button').last(),
      // Location: Sales Action row. Action: opens context menu with row-specific actions.
      salesActionSidePanel: page.locator('[class*="SidePanel"]').first(),
      // Location: right-side SalesActionPanel. Action: displays selected sales action details.
      infoTab: link(page, /uebersicht|\u00fcbersicht/i).or(tab(page, /uebersicht|\u00fcbersicht/i)),
      // Location: SalesActionPanel tabs. Action: opens info/overview tab.
      customerInfoTab: link(page, /kund/i).or(tab(page, /kund/i)),
      // Location: SalesActionPanel tabs. Action: opens customer/contact info.
      customerInteractionsTab: link(page, /aktivitaet|aktivit\u00e4t/i).or(tab(page, /aktivitaet|aktivit\u00e4t/i)),
      // Location: SalesActionPanel tabs. Action: opens activities/customer interactions.
      documentsTab: link(page, /dokument/i).or(tab(page, /dokument/i)),
      // Location: SalesActionPanel tabs. Action: opens documents upload/list tab.
      orderStatusTab: link(page, /bestellstatus|order/i).or(tab(page, /bestellstatus|order/i)),
      // Location: SalesActionPanel tabs for FTTH/orderable actions. Action: opens order status tab.
      preContractingTab: link(page, /precontracting|vorvertrag/i).or(tab(page, /precontracting|vorvertrag/i)),
      // Location: SalesActionPanel second-run flow. Action: opens pre-contracting tab.
      captureActivity: button(page, /Aktivitaet erfassen|Aktivit\u00e4t erfassen/i),
      // Location: SalesActionPanel action bar. Action: opens CaptureActivityModal.
      captureContract: button(page, /auftrag|bestellung|vertrag|erfassen/i),
      // Location: SalesActionPanel action bar. Action: loads sales microflow/external order widget.
      partnerWeb: button(page, /Partnerweb/i),
      // Location: SalesActionPanel action bar. Action: opens Partnerweb link.
      planSketch: button(page, /Planskizze|Plan Sketch/i),
      // Location: SalesActionPanel action bar. Action: opens/downloads plan sketch depending on data.
      agreement: button(page, /einverstaendnis|einverst\u00e4ndnis|zustimmung/i),
      // Location: SalesActionPanel action bar. Action: opens declaration/consent flow.
      deleteSalesAction: button(page, /Sales Action loeschen|Sales Action l\u00f6schen/i),
      // Location: SalesActionPanel action bar. Action: opens delete confirmation modal.
      shortcutNotMet: page.locator('button').filter({ hasText: /nicht angetroffen/i }),
      // Location: SalesActionPanel action bar shortcut. Action: records "not met" activity.
      shortcutNotReached: page.locator('button').filter({ hasText: /nicht erreicht/i }),
      // Location: SalesActionPanel action bar shortcut. Action: records "not reached" activity.
      editStatus: button(page, /bearbeiten/i),
      // Location: status/info sections. Action: starts edit mode for status/assignment/details.
      assignTo: button(page, /zuweisen|uebernehmen|\u00fcbernehmen/i),
      // Location: assignment modal/section. Action: confirms assignment mutation.
      assigneeMultiSelect: page.locator('[class*="MultiSelect"], [role="combobox"]').first(),
      // Location: AssignToSection. Action: selects user/team assignees.
      activityKeep: button(page, /Aktivitaet behalten|Aktivit\u00e4t behalten/i),
      // Location: delete-activity modal. Action: cancels delete.
      activityDeleteConfirm: button(page, /Ja, Aktivitaet Loeschen|Ja, Aktivit\u00e4t L\u00f6schen/i),
      // Location: delete-activity modal. Action: confirms activity deletion.
      manageAppointment: button(page, /Termin verwalten/i),
      // Location: appointments area. Action: loads appointment management external widget.
      bookAppointment: button(page, /Termin buchen/i),
      // Location: appointments area. Action: loads booking external widget.
      captureAppointmentActivity: button(page, /Aktivitaet zu Termin erfassen|Aktivit\u00e4t zu Termin erfassen/i),
      // Location: appointment accordion/action. Action: opens activity capture for selected appointment.
      omcOpen: button(page, /Oeffnen in OMC|\u00d6ffnen in OMC/i),
      // Location: order status tab. Action: opens OMC URL.
      documentDropzone: page.locator('[class*="FileUploader"], input[type="file"]').first(),
      // Location: documents tab. Action: uploads document file to BF/document service.
      keepDocument: button(page, /Dokument behalten/i),
      // Location: delete-document modal. Action: cancels document deletion.
      deleteDocumentConfirm: button(page, /Ja, Dokument Loeschen|Ja, Dokument L\u00f6schen/i)
      // Location: delete-document modal. Action: confirms document deletion.
    };
  },

  userAdministration(page: Page): LocatorGroup {
    return {
      usersTab: link(page, /Benutzer/i).or(tab(page, /Benutzer/i)),
      // Location: /benutzerverwaltung route tabs. Action: opens Users table.
      teamsTab: link(page, /Teams/i).or(tab(page, /Teams/i)),
      // Location: /benutzerverwaltung route tabs. Action: opens Teams table.
      organizationsTab: link(page, /Organisationen/i).or(tab(page, /Organisationen/i)),
      // Location: /benutzerverwaltung route tabs. Action: opens Organizations table.
      createUser: button(page, /Benutzer erstellen/i),
      // Location: user administration action row. Action: opens CreateUser modal.
      createTeam: button(page, /Team erstellen/i),
      // Location: user administration action row. Action: opens CreateTeam modal.
      createAdminA1: button(page, /Admin A1 erstellen/i),
      // Location: action row for A1 admins. Action: opens CreateAdminUser modal.
      usersTable: page.locator('table, [role="table"], [class*="Users"], [class*="Table"]').first(),
      // Location: Users tab. Action: displays BF users.
      teamsTable: page.locator('table, [role="table"], [class*="Teams"], [class*="Table"]').first(),
      // Location: Teams tab. Action: displays BF teams.
      organizationsTable: page.locator('table, [role="table"], [class*="Organizations"], [class*="Table"]').first(),
      // Location: Organizations tab. Action: displays organizations from service.
      rowByText: (text: string | RegExp): Locator => page.locator('tr, [role="row"]').filter({ hasText: text }),
      // Location: any administration table. Action: finds row; click generally opens a side panel.
      userSidePanel: page.locator('[class*="SidePanel"]').filter({ hasText: /Benutzer|User/i }),
      // Location: UserPanel. Action: shows selected user details/actions.
      teamSidePanel: page.locator('[class*="SidePanel"]').filter({ hasText: /Team/i }),
      // Location: TeamPanel. Action: shows selected team details/actions.
      organizationSidePanel: page.locator('[class*="SidePanel"]').filter({ hasText: /Organisation/i }),
      // Location: OrganizationPanel. Action: shows selected organization details.
      edit: button(page, /Bearbeiten/i),
      // Location: user/team side panels. Action: enters edit mode.
      deactivate: button(page, /Deaktivieren/i),
      // Location: UserPanel. Action: opens DeactivateUser modal / mutation flow.
      activate: button(page, /Aktivieren/i),
      // Location: UserPanel inactive user state. Action: opens ActivateUser modal / mutation flow.
      delete: button(page, /Loeschen|L\u00f6schen/i),
      // Location: user/team action bars. Action: opens delete modal.
      keepUser: button(page, /Benutzer behalten/i),
      // Location: DeleteUser modal. Action: cancels user delete.
      keepTeam: button(page, /Team behalten/i),
      // Location: DeleteTeam modal. Action: cancels team delete.
      userDetailsTab: tab(page, /Benutzerdaten|Details/i),
      // Location: UserAdministrationPanel tabs. Action: opens user details form tab.
      userRolesTab: tab(page, /Rollen|Teams/i),
      // Location: UserAdministrationPanel tabs. Action: opens team/role assignment tab.
      userName: page.getByLabel(/Benutzername|Username/i),
      // Location: Create/Edit user form. Action: sets username field.
      firstName: page.getByLabel(/Vorname/i),
      // Location: Create/Edit user form. Action: sets first name.
      lastName: page.getByLabel(/Nachname/i),
      // Location: Create/Edit user form. Action: sets last name.
      email: page.getByLabel(/E-Mail|Email/i),
      // Location: Create/Edit user form. Action: sets email.
      organization: page.getByLabel(/Organisation/i),
      // Location: Create user/team/change organization forms. Action: selects organization.
      teamName: page.getByLabel(/Teambezeichnung/i),
      // Location: Create/Edit team form. Action: sets team display name.
      addUserToTeam: button(page, /Benutzer hinzufuegen|Benutzer hinzuf\u00fcgen/i),
      // Location: TeamPanel edit area. Action: opens add-user-to-team selection controls.
      userSearchOrSelect: page.getByLabel(/Benutzer suchen oder auswaehlen|Benutzer suchen oder ausw\u00e4hlen/i),
      // Location: TeamPanel user assignment form. Action: selects/searches user.
      showUsersWithoutTeamOnly: checkbox(page, /nur Benutzer ohne Team anzeigen/i),
      // Location: TeamPanel user assignment form. Action: filters selectable users.
      continueCreateAnotherUser: button(page, /weiteren Benutzer erstellen/i),
      // Location: CreateUser success modal. Action: restarts create user flow.
      continueCreateAnotherAdmin: button(page, /weiteren Admin A1 erstellen/i)
      // Location: CreateAdminUser success modal. Action: restarts create admin flow.
    };
  },

  imports(page: Page): LocatorGroup {
    return {
      searchInput: page.getByPlaceholder(/Suche in Importe/i),
      // Location: /importe top search row. Action: searches import protocol table.
      changeOrganization: button(page, /Organisation wechseln/i),
      // Location: Imports action row. Action: opens ChangeContractSectionsOrganization modal.
      importData: button(page, /Daten importieren/i),
      // Location: Imports action row. Action: opens ImportObjectsModal.
      table: page.locator('table, [role="table"], [class*="ImportsTable"], [class*="Table"]').first(),
      // Location: Imports page. Action: displays BF import protocols.
      rowByText: (text: string | RegExp): Locator => page.locator('tr, [role="row"]').filter({ hasText: text }),
      // Location: Imports table. Action: finds matching import row.
      undoImport: button(page, /Rueckgaengig machen|R\u00fcckg\u00e4ngig machen/i),
      // Location: import row RevertImportButton. Action: opens RevertConfirmModal.
      doNotUndoImport: button(page, /Nicht rueckgaengig machen|Nicht r\u00fcckg\u00e4ngig machen/i),
      // Location: revert import modal. Action: cancels revert.
      deleteImportedData: button(page, /Daten loeschen|Daten l\u00f6schen/i),
      // Location: revert import modal. Action: confirms import rollback/deletion.
      restartImport: button(page, /Import neu starten/i),
      // Location: ImportObjectsModal error/success states. Action: restarts wizard.
      continueImport: button(page, /Import fortsetzen/i),
      // Location: ImportObjectsModal cancel confirmation. Action: returns to import wizard.
      cancelImport: button(page, /Import abbrechen/i),
      // Location: ImportObjectsModal cancel confirmation. Action: closes and aborts wizard.
      continueImportFlow: button(page, /Weiter|Import starten|Importieren/i),
      // Location: ImportObjectsModal wizard footer. Action: advances/imports depending on step.
      backToSelection: button(page, /Zurueck zur Auswahl|Zur\u00fcck zur Auswahl/i),
      // Location: ImportObjectsModal wizard footer. Action: returns to previous selection step.
      fileDropzone: page.locator('[class*="FileUploader"], input[type="file"]').first(),
      // Location: ImportObjectsModal upload step. Action: uploads CSV/import file.
      organizationSelect: page.getByLabel(/Organisation/i),
      // Location: ChangeContractSectionsOrganization modal. Action: selects new organization.
      changeOrganizationConfirm: button(page, /Organisation wechseln|Speichern|Uebernehmen|\u00dcbernehmen/i)
      // Location: ChangeContractSectionsOrganization modal footer. Action: saves organization change.
    };
  },

  configuration(page: Page): LocatorGroup {
    return {
      overviewNav: link(page, /uebersicht|\u00fcbersicht/i),
      // Location: Configuration vertical nav. Action: opens overview.
      interactionOutcomesNav: link(page, /abschlussgruende|abschlussgr\u00fcnde/i),
      // Location: Configuration vertical nav. Action: opens interaction outcomes/closing reasons.
      tasksNav: link(page, /aufgaben/i),
      // Location: Configuration vertical nav. Action: opens Sales Action tasks.
      groupsNav: link(page, /gruppen/i),
      // Location: Configuration vertical nav. Action: opens interaction groups.
      regimeNav: link(page, /regime/i),
      // Location: Configuration vertical nav. Action: opens regime table.
      interactionSectionsNav: link(page, /aktivitaeten-setup|aktivit\u00e4ten-setup/i),
      // Location: Configuration vertical nav. Action: opens interaction sections setup.
      tasksSearch: page.getByPlaceholder(/Suche in Aufgaben/i),
      // Location: tasks configuration page. Action: searches tasks table.
      createTask: button(page, /Aufgabe erstellen/i),
      // Location: tasks configuration page. Action: opens CreateSaTaskModal.
      regimeSearch: page.getByPlaceholder(/Suche in Regime/i),
      // Location: regime configuration page. Action: searches regime table.
      createRegime: button(page, /Regime erstellen/i),
      // Location: regime page action row. Action: opens CreateRegimeModal.
      interactionOutcomeSearch: page.getByPlaceholder(/Suche in Abschluss/i),
      // Location: interaction outcome page. Action: searches closing reasons.
      createInteractionOutcome: button(page, /Abschlussgruende erstellen|Abschlussgr\u00fcnde erstellen/i),
      // Location: interaction outcome page. Action: opens CreateInteractionOutcomeModal.
      createInteractionSection: button(page, /Aktivitaet|Aktivit\u00e4t|Section|Bereich|erstellen/i),
      // Location: interaction section configuration page. Action: creates section/setup entry when present.
      table: page.locator('table, [role="table"], [class*="Table"]').first(),
      // Location: any configuration list page. Action: displays BF configuration rows.
      rowByText: (text: string | RegExp): Locator => page.locator('tr, [role="row"]').filter({ hasText: text }),
      // Location: configuration table. Action: finds matching config row.
      rowContextMenu: (text: string | RegExp): Locator =>
        page.locator('tr, [role="row"]').filter({ hasText: text }).locator('button').last(),
      // Location: configuration table row. Action: opens edit/delete menu.
      outcomeDisplayText: page.getByLabel(/Display Text|Anzeigename|Abschluss/i),
      // Location: interaction outcome create/detail form. Action: sets display text.
      outcomeKey: page.getByLabel(/Key|Schluessel|Schl\u00fcssel/i),
      // Location: interaction outcome create/detail form. Action: sets unique outcome key.
      taskName: page.getByLabel(/Aufgabe|Task/i),
      // Location: create task modal/form. Action: sets task name.
      regimeName: page.getByLabel(/Regime/i)
      // Location: create regime modal/form. Action: sets regime name.
    };
  },

  modals(page: Page): LocatorGroup {
    return {
      any: dialog(page),
      // Location: any ModalDialog. Action: generic modal wait/assert root.
      createUser: dialog(page).filter({ hasText: /Benutzer erstellen/i }),
      // Location: opened from Benutzerverwaltung action row. Action: contains create user wizard.
      createAdminUser: dialog(page).filter({ hasText: /Admin A1 erstellen/i }),
      // Location: opened by Admin A1 erstellen. Action: contains admin create wizard.
      createTeam: dialog(page).filter({ hasText: /Team erstellen/i }),
      // Location: opened by Team erstellen. Action: contains team create form.
      activateUser: dialog(page).filter({ hasText: /Aktivieren/i }),
      // Location: opened from inactive UserPanel. Action: confirms user activation.
      deactivateUser: dialog(page).filter({ hasText: /Deaktivieren/i }),
      // Location: opened from active UserPanel. Action: confirms user deactivation.
      deleteUser: dialog(page).filter({ hasText: /Benutzer.*loeschen|Benutzer.*l\u00f6schen/i }),
      // Location: opened from UserPanel delete action. Action: confirms user deletion.
      deleteTeam: dialog(page).filter({ hasText: /Team.*loeschen|Team.*l\u00f6schen/i }),
      // Location: opened from TeamPanel delete action. Action: confirms team deletion.
      importObjects: dialog(page).filter({ hasText: /Import|Daten importieren/i }),
      // Location: opened from Importe > Daten importieren. Action: import wizard.
      changeOrganization: dialog(page).filter({ hasText: /Organisation wechseln/i }),
      // Location: opened from Importe > Organisation wechseln. Action: changes contract section organization.
      captureActivity: dialog(page).filter({ hasText: /Aktivitaet erfassen|Aktivit\u00e4t erfassen/i }),
      // Location: opened from SalesActionPanel action bar. Action: captures customer interaction/activity.
      captureContract: dialog(page).filter({ hasText: /Vertrag|Auftrag|Bestellung/i }),
      // Location: sales/order flow modal or external flow shell. Action: captures contract/order.
      deleteSalesAction: dialog(page).filter({ hasText: /Sales Action loeschen|Sales Action l\u00f6schen/i }),
      // Location: opened from SalesActionPanel delete. Action: confirms sales action deletion.
      deleteDocument: dialog(page).filter({ hasText: /Dokument loeschen|Dokument l\u00f6schen/i }),
      // Location: opened from documents tab. Action: confirms document deletion.
      allFilters: dialog(page).filter({ hasText: /Filter/i }),
      // Location: opened from filter bar. Action: full filter selection modal.
      close: button(page, /Schliessen|Schlie\u00dfen|Abbrechen/i)
      // Location: modal footer/header. Action: closes or cancels modal.
    };
  },

  forms(page: Page): LocatorGroup {
    return {
      textFieldByLabel: (name: string | RegExp): Locator => page.getByLabel(name),
      // Location: generic Gucci TextField forms. Action: fill by visible label.
      textFieldByPlaceholder: (placeholder: string | RegExp): Locator => page.getByPlaceholder(placeholder),
      // Location: search fields and unlabeled text inputs. Action: fill by placeholder.
      selectByLabel: (name: string | RegExp): Locator => page.getByLabel(name).or(page.getByRole('combobox', { name })),
      // Location: Gucci SelectField/MultiSelectField. Action: opens/selects dropdown value by label.
      checkboxByLabel: (name: string | RegExp): Locator => checkbox(page, name),
      // Location: checkbox filters/forms. Action: toggles checkbox.
      radioByLabel: (name: string | RegExp): Locator => page.getByRole('radio', { name }),
      // Location: RadioGroupField forms. Action: selects radio option.
      dateByLabel: (name: string | RegExp): Locator => page.getByLabel(name),
      // Location: Gucci DatePicker. Action: fills/selects date.
      fileInput: page.locator('input[type="file"]'),
      // Location: file uploader components. Action: setInputFiles for import/documents.
      submit: button(page, /speichern|uebernehmen|\u00fcbernehmen|weiter|importieren|erstellen|zuweisen/i),
      // Location: form modal footers. Action: submits current form/wizard step.
      cancel: button(page, /abbrechen/i)
      // Location: form modal footers. Action: cancels edit/create flow.
    };
  },

  sections(page: Page): LocatorGroup {
    return {
      byHeading: (name: string | RegExp): Locator => page.getByRole('heading', { name }),
      // Location: generic section heading. Action: anchors assertions around named sections.
      byText: (text: string | RegExp): Locator => page.locator('section, article, div').filter({ hasText: text }).first(),
      // Location: generic page/side-panel section. Action: finds container by visible content.
      sidePanel: page.locator('[class*="SidePanel"]').first(),
      // Location: right-side panel. Action: root for object/sales-action/user/team detail assertions.
      modalBody: dialog(page).locator('[class*="Modal"], [class*="Content"], form').first(),
      // Location: inside ModalDialog. Action: scopes form/modal body operations.
      actionBar: page.locator('[class*="ActionBar"], [class*="Actions"], [class*="LinkButtons"]').first(),
      // Location: page/side-panel action rows. Action: contains primary buttons.
      filterSection: page.locator('[class*="FilterSection"], [class*="Filter"]').first(),
      // Location: table routes under search/action row. Action: contains filter dropdowns and chips.
      tableSection: page.locator('table, [role="table"], [class*="Table"]').first(),
      // Location: any list route. Action: scopes table assertions/clicks.
      questionnaireSection: page.locator('[class*="Questionnaire"], [class*="Question"]').first(),
      // Location: ObjectPanel questionnaire tab. Action: scopes questionnaire edit/assertions.
      customerInteractionsSection: page.locator('[class*="CustomerInteraction"], [class*="Accordion"]').first(),
      // Location: SalesActionPanel customer interactions tab. Action: scopes activity accordions.
      documentsSection: page.locator('[class*="Documents"], [class*="FileUploader"]').first()
      // Location: SalesActionPanel documents tab. Action: scopes document upload/list/delete controls.
    };
  }
};

export type Door2DoorLocators = typeof door2doorLocators;
// Exported type for reuse in Playwright fixtures/helpers.
