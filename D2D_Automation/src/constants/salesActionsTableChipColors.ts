// Covers Sales Actions table row chip colors, split into one constant per chip kind so
// they're easy to tell apart at a glance.

export const SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS = {
  abgeschlossenNegative: { label: 'abgeschlossen', color: 'rgb(221, 221, 221)' },
  abgeschlossenPositive: { label: 'abgeschlossen', color: 'rgb(77, 150, 0)' },
  nichtdurchführbar: { label: 'nicht durchführbar', color: 'rgb(218, 41, 28)' },
  inbearbeitung: { label: 'in Bearbeitung', color: 'rgb(98, 149, 172)' },
} as const;

// Aufgabe's task chips all share this one color regardless of which specific task is
// shown, since each task's own label text already lives in aufgabeFilterOptions
// (salesActionFiltersValues.ts), not here — so this is just the color, no label.
export const SALES_ACTIONS_TABLE_AUFGABE_CHIP_COLOR = 'rgb(88, 88, 88)';

// Confirmed 2026-09-16. A separate constant from STATUS above even though the colors
// happen to match two existing status colors — Phase is a different concept from Status,
// so keeping them apart avoids implying a relationship that doesn't exist.
export const SALES_ACTIONS_TABLE_PHASE_CHIP_COLORS = {
  preContracting: { label: 'Pre-Contracting', color: 'rgb(98, 149, 172)' },
  secondRun: { label: '2nd Run', color: 'rgb(229, 151, 0)' },
} as const;
