export const OBJEKTE_FILTERS = {
  contractSection: { id: 'contractSection', label: 'Baulos/Einsatzname' },
  zip: { id: 'zip', label: 'PLZ' },
  organizations: { id: 'organizations', label: 'Organisation' },
  salesStart: { id: 'salesStart', label: 'Verkaufsstart' },
  fragebogenStatus: { id: 'fragebogenStatus', label: 'Fragebogen' },
} as const;

// Objekte also has 3 "quick filter" toggle buttons — a different control type
// (role="button" + aria-pressed, not a dropdown). Test with aria-pressed, not visibility.
export const OBJEKTE_QUICK_FILTERS = {
  open: { id: 'quick-filter-objectStatus-open', label: 'nicht übergeben' },
  rejected: { id: 'quick-filter-objectStatus-rejected', label: 'zurückgewiesen' },
  assigned: { id: 'quick-filter-objectStatus-assigned', label: 'übergeben' },
} as const;
