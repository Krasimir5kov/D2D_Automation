export const REGIME_IDS = {
  tableRow: (regimeId: number | string): string => `regime-row-${regimeId}`,
  contextMenuButton: (regimeId: number | string): string => `regime-${regimeId}-context-menu-button`
} as const;
