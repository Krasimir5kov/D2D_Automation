export const USER_SIDE_PANEL_STATIC_IDS = {
  wrapper: 'user-side-panel',
  ariaLabel: 'User side panel',
  closeButton: 'user-side-panel-close-button'
} as const;

export const USER_SIDE_PANEL_STATE = {
  open: 'open',
  closed: 'closed'
} as const;

export const USER_SIDE_PANEL_IDS = {
  sidePanel: (userId: number | string): string => `user-side-panel-${userId}`,
  editButton: (userId: number | string): string => `user-${userId}-edit-button`,
  deactivateButton: (userId: number | string): string => `user-${userId}-deactivate-button`,
  deleteButton: (userId: number | string): string => `user-${userId}-delete-button`,
  activateButton: (userId: number | string): string => `user-${userId}-activate-button`,
  editCancelButton: (userId: number | string): string => `user-${userId}-edit-cancel-button`,
  editSaveButton: (userId: number | string): string => `user-${userId}-edit-save-button`,
  activateDialog: (userId: number | string): string => `activate-user-dialog-${userId}`,
  activateCancelButton: 'activate-user-cancel-button',
  activateConfirmButton: 'activate-user-confirm-button',
  deactivateDialog: (userId: number | string): string => `deactivate-user-dialog-${userId}`,
  deactivateCancelButton: 'deactivate-user-cancel-button',
  deactivateConfirmButton: 'deactivate-user-confirm-button',
  deleteDialog: (userId: number | string): string => `delete-user-dialog-${userId}`,
  deleteCancelButton: 'delete-user-cancel-button',
  deleteConfirmButton: 'delete-user-confirm-button',
  infoOrganisation: (userId: number | string): string => `user-${userId}-organisation`,
  infoCorporateAccount: (userId: number | string): string => `user-${userId}-corporate-account`,
  infoPartnerwebId: (userId: number | string): string => `user-${userId}-partnerweb-id`,
  infoName: (userId: number | string): string => `user-${userId}-name`,
  infoEmail: (userId: number | string): string => `user-${userId}-email`,
  infoStatus: (userId: number | string): string => `user-${userId}-status`,
  infoCreatedAt: (userId: number | string): string => `user-${userId}-created-at`,
  infoCreatedBy: (userId: number | string): string => `user-${userId}-created-by`,
  infoUpdatedAt: (userId: number | string): string => `user-${userId}-updated-at`,
  infoUpdatedBy: (userId: number | string): string => `user-${userId}-updated-by`,
  addRoleButton: 'user-side-panel-add-role-button',
  roleEditButton: (roleValue: number | string): string => `user-side-panel-role-edit-button-${roleValue}`,
  roleDeleteButton: (roleValue: number | string): string => `user-side-panel-role-delete-button-${roleValue}`
} as const;
