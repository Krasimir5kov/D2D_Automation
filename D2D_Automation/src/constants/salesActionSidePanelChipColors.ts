export const SIDE_PANEL_CHIP_COLORS: Record<string, string> = {
    'erfasst': 'rgb(77, 150, 0)',
    'offen': 'rgb(229, 151, 0)',
    'nicht erfasst': 'rgb(229, 151, 0)',
    // Confirmed 2026-09-16 — Phase chip colors in the side panel header.
    'Pre-Contracting': 'rgb(98, 149, 172)',
    '2nd Run': 'rgb(229, 151, 0)',
    // Confirmed 2026-09-16 — Planskizze chip colors (offen -> orange, reuses the 'offen' key
    // above; abgeschlossen -> green, same green as 'erfasst').
    'abgeschlossen': 'rgb(77, 150, 0)',
};