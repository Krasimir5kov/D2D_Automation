export const USER_ADMINISTRATION_IDS = {
  tableRow: (userId: number | string): string => `user-row-${userId}`,
  tableRowFirstNameCell: (userId: number | string): string => `user-${userId}-first-name`,
  tableRowLastNameCell: (userId: number | string): string => `user-${userId}-last-name`,
  tableRowStatusCell: (userId: number | string): string => `user-${userId}-status`,
  tableRowEmailCell: (userId: number | string): string => `user-${userId}-email`,
  tableRowOrganizationCell: (userId: number | string): string => `user-${userId}-organization`,
  tableRowRoleCell: (userId: number | string): string => `user-${userId}-role`,
  tableRowContextMenuButton: (userId: number | string): string => `user-${userId}-context-menu-button`,
  contextMenuOption: {
    details: (userId: number | string): string => `user-${userId}-context-menu-option-details`,
    edit: (userId: number | string): string => `user-${userId}-context-menu-option-edit`,
    deactivate: (userId: number | string): string => `user-${userId}-context-menu-option-deactivate`,
    delete: (userId: number | string): string => `user-${userId}-context-menu-option-delete`,
    activate: (userId: number | string): string => `user-${userId}-context-menu-option-activate`
  },
  pageNavigator: 'page-navigator-users',
  createUserButton: 'create-user-button',
  createTeamButton: 'create-team-button',
  createAdminA1Button: 'create-admin-a1-button'
} as const;
