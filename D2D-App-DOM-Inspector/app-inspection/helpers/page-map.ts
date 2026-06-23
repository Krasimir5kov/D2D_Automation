export interface PageConfig {
  id: string;
  name: string;
  path: string;
  description: string;
  expectedSections: string[];
  expectedFilters: string[];
  hasSidePanel: boolean;
  hasAlleFilterModal: boolean;
  hasCreateModal: boolean;
  listSections: string[];
}

export const PAGES: PageConfig[] = [
  {
    id: 'baulose',
    name: 'Baulose',
    path: '/baulose',
    description: 'Construction lots page with FTTH-AUSBAU and BESTANDSBAU list sections',
    expectedSections: ['FTTH-AUSBAU', 'BESTANDSBAU'],
    expectedFilters: [],
    hasSidePanel: true,
    hasAlleFilterModal: false,
    hasCreateModal: false,
    listSections: ['FTTH-AUSBAU', 'BESTANDSBAU'],
  },
  {
    id: 'objekte',
    name: 'Objekte',
    path: '/objekte',
    description: 'Objects page with NEUBAU, FTTH-AUSBAU, BESTANDSBAU sections and Alle Filter modal',
    expectedSections: ['NEUBAU', 'FTTH-AUSBAU', 'BESTANDSBAU'],
    expectedFilters: [],
    hasSidePanel: true,
    hasAlleFilterModal: true,
    hasCreateModal: false,
    listSections: ['NEUBAU', 'FTTH-AUSBAU', 'BESTANDSBAU'],
  },
  {
    id: 'sales-action',
    name: 'Sales Action',
    path: '/sales-action',
    description: 'Sales action page with list sections, filters and side panel',
    expectedSections: [],
    expectedFilters: [],
    hasSidePanel: true,
    hasAlleFilterModal: true,
    hasCreateModal: false,
    listSections: [],
  },
  {
    id: 'benutzerverwaltung',
    name: 'Benutzerverwaltung',
    path: '/benutzerverwaltung',
    description: 'User management page with users, organizations, teams',
    expectedSections: ['Users', 'Organizations', 'Teams'],
    expectedFilters: [],
    hasSidePanel: false,
    hasAlleFilterModal: false,
    hasCreateModal: true,
    listSections: [],
  },
  {
    id: 'importe',
    name: 'Importe',
    path: '/importe',
    description: 'Imports page with filters, quick buttons and non-clickable list view',
    expectedSections: [],
    expectedFilters: [],
    hasSidePanel: false,
    hasAlleFilterModal: false,
    hasCreateModal: false,
    listSections: [],
  },
  {
    id: 'konfiguration',
    name: 'Konfiguration',
    path: '/konfiguration',
    description: 'Configuration page with sidebar navigation to different list views',
    expectedSections: [],
    expectedFilters: [],
    hasSidePanel: false,
    hasAlleFilterModal: false,
    hasCreateModal: false,
    listSections: [],
  },
];

export function getPageConfig(id: string): PageConfig | undefined {
  return PAGES.find((p) => p.id === id);
}

export const SAFE_NAVIGATION_PATHS: Record<string, string[]> = {
  baulose: ['/baulose'],
  objekte: ['/objekte'],
  'sales-action': ['/sales-action', '/sales', '/salesaction'],
  benutzerverwaltung: ['/benutzerverwaltung', '/users', '/user-management'],
  importe: ['/importe', '/imports'],
  konfiguration: ['/konfiguration', '/config', '/configuration', '/settings'],
};
