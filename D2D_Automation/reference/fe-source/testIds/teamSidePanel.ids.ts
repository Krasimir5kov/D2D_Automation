export const TEAM_SIDE_PANEL_STATE = {
  open: 'open',
  closed: 'closed'
} as const;

export const TEAM_SIDE_PANEL_IDS = {
  sidePanel: (teamId: number | string): string => `team-side-panel-${teamId}`,
  deleteButton: (teamId: number | string): string => `team-${teamId}-delete-button`,
  editButton: (teamId: number | string): string => `team-${teamId}-edit-button`,
  editCancelButton: (teamId: number | string): string => `team-${teamId}-edit-cancel-button`,
  editSaveButton: (teamId: number | string): string => `team-${teamId}-edit-save-button`,
  addUserButton: (teamId: number | string): string => `team-${teamId}-add-user-button`,
  addUserCancelButton: (teamId: number | string): string => `team-${teamId}-add-user-cancel-button`,
  addUserApplyButton: (teamId: number | string): string => `team-${teamId}-add-user-apply-button`,
  agentCheckbox: (teamId: number | string): string => `team-${teamId}-agent-checkbox`,
  channelCheckbox: (teamId: number | string): string => `team-${teamId}-channel-checkbox`,
  removeMemberButton: (teamId: number | string, userId: number | string): string =>
    `team-${teamId}member${userId}-remove-button`,
  deleteDialog: (teamId: number | string): string => `delete-team-dialog-${teamId}`,
  deleteCancelButton: 'delete-team-cancel-button',
  deleteConfirmButton: 'delete-team-confirm-button',
  infoOrganisation: (teamId: number | string): string => `team-${teamId}-organisation`,
  infoName: (teamId: number | string): string => `team-${teamId}-name`
} as const;
