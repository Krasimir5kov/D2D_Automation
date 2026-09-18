export const ORGANIZATION_SIDE_PANEL_STATE = {
  open: 'open',
  closed: 'closed'
} as const;

export const ORGANIZATION_SIDE_PANEL_IDS = {
  sidePanel: (orgId: number | string): string => `organization-side-panel-${orgId}`,
  closeButton: (orgId: number | string): string => `organization-side-panel-${orgId}-close-button`,
  infoName: (orgId: number | string): string => `organization-${orgId}-name`,
  infoEmailAddresses: (orgId: number | string): string => `organization-${orgId}-email-addresses`,
  infoSalesRegion: (orgId: number | string): string => `organization-${orgId}-sales-region`
} as const;
