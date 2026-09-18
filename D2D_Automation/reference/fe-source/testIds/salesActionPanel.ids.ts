export const SALES_ACTION_STATUS_ARIA_LABELS: Record<string, string> = {
  OPEN: 'open',
  IN_PROGRESS: 'in progress',
  CLOSED: 'closed - negative',
  CARRIED_OUT: 'completed',
  NOT_EXECUTABLE: 'not feasible'
};

export const getSalesActionStatusAriaLabel = (status: string, positiveOutcome?: boolean | null): string => {
  if (status === 'CLOSED' && positiveOutcome) {
    return 'closed - positive';
  }
  return SALES_ACTION_STATUS_ARIA_LABELS[status] || 'no status';
};

export const SALES_ACTION_PANEL_IDS = {
  editStatusButton: (id: number | string) => `sales-action-${id}-edit-status-button`,
  editAssignmentButton: (id: number | string) => `sales-action-${id}-edit-assignment-button`,
  noteAddButton: (id: number | string) => `sales-action-${id}-note-add-button`,
  noteEditButton: (id: number | string) => `sales-action-${id}-note-edit-button`,
  noteDeleteButton: (id: number | string) => `sales-action-${id}-note-delete-button`,
  hintAddButton: (id: number | string) => `sales-action-${id}-hint-add-button`,
  hintEditButton: (id: number | string) => `sales-action-${id}-hint-edit-button`,
  hintDeleteButton: (id: number | string) => `sales-action-${id}-hint-delete-button`,
  hintCancelButton: (id: number | string) => `sales-action-${id}-hint-cancel-button`,
  hintSaveButton: (id: number | string) => `sales-action-${id}-hint-save-button`,
  captureActivityButton: (id: number | string) => `sales-action-${id}-capture-activity-button`,
  deleteButton: (id: number | string) => `sales-action-${id}-delete-button`,
  correctDoorNumberButton: (id: number | string) => `sales-action-${id}-correct-door-number-button`,
  planSketchButton: (id: number | string) => `sales-action-${id}-plan-sketch-button`,
  captureOrderButton: (id: number | string) => `sales-action-${id}-capture-order-button`,
  captureAblegerButton: (id: number | string) => `sales-action-${id}-capture-ableger-button`,
  customerInteractionToggle: (id: number | string, num: number) =>
    `sales-action-${id}-customer-interaction-${num}-toggle`,
  documentItem: (salesActionId: number | string, documentId: string | number) =>
    `sales-action-${salesActionId}-document-${documentId}`
} as const;

export const CAPTURE_ACTIVITY_MODAL_IDS = {
  modal: 'sales-action-activity-modal',
  cancelButton: 'sales-action-activity-cancel-button',
  saveButton: 'sales-action-activity-save-button',
  performedByOption: (userId: string | number) => `activity-performed-by-option-${userId}`
} as const;
