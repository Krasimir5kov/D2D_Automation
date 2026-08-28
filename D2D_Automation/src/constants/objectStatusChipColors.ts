// Confirmed live via devtools (2026-08-26) — the table row status chip is a generic
// 4-variant component (success/warning/info/error). Several different status strings
// across different pages reuse the same variant/color (e.g. "vollständig" and
// "bestätigt" are both the green variant) — this maps by exact visible text, not by
// assuming one status string owns a unique color.
//
// This is Component 1 ("table status chip", class prefix bzOw_OQStsdwnegd6Atq) — do not
// confuse with Component 2 (the outline filter pill / applied-filter chip, class prefix
// qWiipqdmvgb4hpbhqJmH), which is a different component using border-color, not
// background-color, and isn't a table-row concern at all.
export const TABLE_STATUS_CHIP_COLORS: Record<string, string> = {
    'vollständig': 'rgb(77, 150, 0)',
    'bestätigt': 'rgb(77, 150, 0)',
    'unvollständig': 'rgb(229, 151, 0)',
    'vor Aviso': 'rgb(98, 149, 172)',
    'zurückgewiesen': 'rgb(218, 41, 28)',
    'nicht übergeben': 'rgb(229, 151, 0)',
    'übergeben': 'rgb(98, 149, 172)'
};
