export const SALES_ACTION_TASK_IDS = {
  tableRow: (taskId: number | string): string => `task-row-${taskId}`
} as const;

export const SALES_ACTION_TASK_CREATE_IDS = {
  button: 'create-task-button',
  modal: 'create-task-modal',
  closeButton: 'create-task-close-button',
  cancelButton: 'create-task-cancel-button',
  confirmButton: 'create-task-confirm-button'
} as const;
