export const SALES_ACTION_IDS = {
  tableRow: (salesActionId: number | string): string => `sales-action-row-${salesActionId}`,
  tableRowMainInfo: (salesActionId: number | string): string => `sales-action-row-${salesActionId}-main-info`,
  tableRowStatus: (salesActionId: number | string): string => `sales-action-row-${salesActionId}-status`,
  tableRowContextMenu: (salesActionId: number | string): string => `sales-action-row-${salesActionId}-context-menu`,
  tableRowQuickCreationCustomerInteraction: (salesActionId: number | string): string =>
    `sales-action-row-${salesActionId}-quick-creation-customer-interaction`,
  contextMenuButtonAriaLabel: 'Open sales action context menu',
  pagination: 'sales-actions-pagination',
  contextMenuOption: {
    openDetailView: 'sales-action-context-menu-option-open-detail-view',
    recordActivity: 'sales-action-context-menu-option-record-activity',
    recordSketch: 'sales-action-context-menu-option-record-sketch',
    recordOrder: 'sales-action-context-menu-option-record-order',
    customerNotMet: 'sales-action-context-menu-option-customer-not-met',
    notReached: 'sales-action-context-menu-option-not-reached',
    deleteSalesAction: 'sales-action-context-menu-option-delete-sales-action'
  }
} as const;
