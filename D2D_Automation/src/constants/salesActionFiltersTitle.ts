export const SALES_ACTION_FILTER_TITLES_AND_ID = {
  contractSection: { id: 'contractSection', label: 'Baulos/Einsatzname' },
  organizations: { id: 'organizations', label: 'Organisation' },
  salesActionObjectSubType: { id: 'salesActionObjectSubType', label: 'Regime' },
  contractSectionPhaseAdmins: { id: 'contractSectionPhaseAdmins', label: 'Phase' },
  appointment: { id: 'appointment', label: 'Termin' },
  salesActionPropertyType: { id: 'salesActionPropertyType', label: 'Immobilienart' },
  salesActionStatus: { id: 'salesActionStatus', label: 'Status' },
  salesActionTasks: { id: 'salesActionTasks', label: 'Aufgabe' },
  salesActionInteractionResults: { id: 'salesActionInteractionResults', label: 'Ergebnis' },
  netDocument: { id: 'netDocument', label: 'Planskizze' },
  hybrisOrder: { id: 'hybrisOrder', label: 'Bestellung über D2D' },
  zustNetdocDocument: { id: 'zustNetdocDocument', label: 'Ableger Zustimmung' },
  customerData: { id: 'customerData', label: 'Kundendaten' },
  salesActionType: { id: 'salesActionType', label: 'Sales Action-Type' },
  salesActionLocationResults: { id: 'salesActionLocationResults', label: 'Objekt' },
  salesActionsAssigneesSearch: { id: 'salesActionsAssigneesSearch', label: 'zugewiesen an' },
  upsellingPotential: { id: 'upsellingPotential', label: 'upselling Potential' },
} as const;

export type Door2DoorFilterKey = keyof typeof SALES_ACTION_FILTER_TITLES_AND_ID;