export const INTERACTION_OUTCOME_LIST_CREATE_IDS = {
  button: 'create-interaction-outcome-button',
  modal: 'create-interaction-outcome-modal',
  closeButton: 'create-interaction-outcome-close-button',
  cancelButton: 'create-interaction-outcome-cancel-button',
  confirmButton: 'create-interaction-outcome-confirm-button'
} as const;

export const CONFIGURATION_NAV_IDS = {
  sidebar: 'configuration-navigation-sidebar'
} as const;

export const INTERACTION_OUTCOME_SIDEBAR_STATE = {
  open: 'open',
  closed: 'closed'
} as const;

export const INTERACTION_OUTCOME_IDS = {
  sidebar: 'interaction-outcome-sidebar',
  tableRow: (outcomeId: number | string): string => `interaction-outcome-row-${outcomeId}`,
  contextMenuButton: (outcomeId: number | string): string => `interaction-outcome-${outcomeId}-context-menu-button`,
  childItem: (outcomeId: number | string): string => `interaction-outcome-child-${outcomeId}`,
  childCloseButton: (outcomeId: number | string): string => `interaction-outcome-child-${outcomeId}-close-button`,
  navChildItem: (outcomeId: number | string): string => `interaction-outcome-nav-child-${outcomeId}`,
  navChildCloseButton: (outcomeId: number | string): string => `interaction-outcome-nav-child-${outcomeId}-close-button`
} as const;
