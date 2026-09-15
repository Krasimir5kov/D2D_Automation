// Confirmed 2026-09-16 — same 2 Phase chip colors already confirmed on the Sales Actions
// page (src/constants/salesActionsTableChipColors.ts), reused here since Baulose's Phase
// filter renders the identical chip. Kept as its own file (not merged into that one) since
// it's a different page's table, even though the values currently coincide.
export const BAULOSE_TABLE_PHASE_CHIP_COLORS = {
  preContracting: { label: 'Pre-Contracting', color: 'rgb(98, 149, 172)' },
  secondRun: { label: '2nd Run', color: 'rgb(229, 151, 0)' },
} as const;
