export const ORGANIZATIONS_IDS = {
  tableRow: (orgId: number | string): string => `organization-row-${orgId}`,
  tableRowNameCell: (orgId: number | string): string => `organization-${orgId}-name`
} as const;
