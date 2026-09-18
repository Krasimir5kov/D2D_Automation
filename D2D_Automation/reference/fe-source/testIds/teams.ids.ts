export const TEAMS_IDS = {
  tableRow: (teamId: number | string): string => `team-row-${teamId}`,
  tableRowContextMenuButton: (teamId: number | string): string => `team-${teamId}-context-menu-button`,
  contextMenuOption: {
    details: (teamId: number | string): string => `team-${teamId}-menu-details`,
    edit: (teamId: number | string): string => `team-${teamId}-menu-edit`,
    delete: (teamId: number | string): string => `team-${teamId}-menu-delete`
  },
  pagination: 'teams-pagination'
} as const;
