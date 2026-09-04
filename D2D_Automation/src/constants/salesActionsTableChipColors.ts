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
