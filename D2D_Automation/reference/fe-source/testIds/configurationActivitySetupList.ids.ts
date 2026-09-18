export const ACTIVITY_SETUP_IDS = {
  tableRow: (setupId: number | string): string => `activity-setup-row-${setupId}`,
  contextMenuButton: (setupId: number | string): string => `activity-setup-${setupId}-context-menu-button`
} as const;

export const ACTIVITY_SETUP_CREATE_IDS = {
  button: 'create-activity-setup-button'
} as const;
