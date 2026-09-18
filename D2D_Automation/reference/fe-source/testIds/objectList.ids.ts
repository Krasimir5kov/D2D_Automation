export const OBJECT_LIST_IDS = {
  tableRow: (objectId: number | string): string => `object-row-${objectId}`,
  tableRowNameCell: (objectId: number | string): string => `object-row-${objectId}-name`,
  tableRowOrganisationCell: (objectId: number | string): string => `object-row-${objectId}-organisation`,
  tableRowContextMenu: (objectId: number | string): string => `object-row-${objectId}-context-menu`,
  pageNavigator: (type: string): string => `page-navigator-${type}`,
  contextMenuOption: {
    openDetailView: 'object-context-menu-option-open-detail-view',
    openQuestionnaire: 'object-context-menu-option-open-questionnaire',
    handoverObject: 'object-context-menu-option-handover-object',
    rejectObject: 'object-context-menu-option-reject-object'
  }
};
