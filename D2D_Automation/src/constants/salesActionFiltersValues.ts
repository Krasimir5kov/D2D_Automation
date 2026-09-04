export const ablegerZustimmungOptions = {
    ablegerAbgelehnt: 'Ableger abgelehnt',
    ablegerZugestimmt: 'Ableger zugestimmt'
};
export const ablegerZustimmungsdokumentOptions = {
    nichtErfasst: 'nicht erfasst',
    erfasst: 'erfasst'
};
export const ergebnisFilterOptions = {
    neubauOption: 'Abschluss anderer POS',
    ftthAusbauOption: 'KGV Check',
    bestandsbauOption : 'Gespräch verweigert'
};
// Confirmed 2026-09-04: only leerverrohrungscheck and nachverdichtung return results in
// FTTH-AUSBAU — every other Aufgabe value here is Bestandsbau-specific.
export const aufgabeFilterOptions = {
    bbiZuFwa: { label: 'BBI zu FWA', expectedInFTTH: false, expectedInBestandsbau: true },
    bbiZuNetcube: { label: 'BBI zu Netcube', expectedInFTTH: false, expectedInBestandsbau: true },
    kupferPhaseOut: { label: 'Kupfer Phase Out', expectedInFTTH: false, expectedInBestandsbau: true },
    kupferZuGlasfaserA1Netz: { label: 'Kupfer zu Glasfaser A1 Netz', expectedInFTTH: false, expectedInBestandsbau: true },
    leerverrohrungscheck: { label: 'Leerverrohrungscheck', expectedInFTTH: true, expectedInBestandsbau: false },
    level0AblegerOeffentl: { label: 'Level 0 (Ableger öffentl)', expectedInFTTH: false, expectedInBestandsbau: true },
    level1AblegerPriv: { label: 'Level 1 (Ableger priv)', expectedInFTTH: false, expectedInBestandsbau: true },
    level3GfImHausOhneAbschlusspunkt: { label: 'Level 3 (GF im Haus ohne Abschlusspunkt)', expectedInFTTH: false, expectedInBestandsbau: true },
    level4GfImWohnbereich: { label: 'Level 4 (GF im Wohnbereich)', expectedInFTTH: false, expectedInBestandsbau: true },
    nachverdichtung: { label: 'Nachverdichtung', expectedInFTTH: true, expectedInBestandsbau: false },
    netcubeZuBbi: { label: 'Netcube zu BBI', expectedInFTTH: false, expectedInBestandsbau: true },
    netcubeZuBbiA1Netz: { label: 'Netcube zu BBI A1 Netz', expectedInFTTH: false, expectedInBestandsbau: true },
    netcubeZuBbiOanTp: { label: 'Netcube zu BBI OAN/TP', expectedInFTTH: false, expectedInBestandsbau: true },
    netcubeZuFwa: { label: 'Netcube zu FWA', expectedInFTTH: false, expectedInBestandsbau: true },
    potsPhaseOut: { label: 'POTS Phase out', expectedInFTTH: false, expectedInBestandsbau: true },
    potsZuBbiA1Netz: { label: 'POTS zu BBI A1 Netz', expectedInFTTH: false, expectedInBestandsbau: true },
    potsZuBbiOanTp: { label: 'POTS zu BBI OAN/TP', expectedInFTTH: false, expectedInBestandsbau: true },
    umsteigerZuOanTpHc: { label: 'Umsteiger zu OAN/TP (HC)', expectedInFTTH: false, expectedInBestandsbau: true },
    umsteigerZuOanTpHp: { label: 'Umsteiger zu OAN/TP (HP)', expectedInFTTH: false, expectedInBestandsbau: true },
    upsellBbi: { label: 'Upsell BBI', expectedInFTTH: false, expectedInBestandsbau: true },
    upsellBbiA1Netz: { label: 'Upsell BBI A1 Netz', expectedInFTTH: false, expectedInBestandsbau: true },
    upsellNetcube: { label: 'Upsell Netcube', expectedInFTTH: false, expectedInBestandsbau: true },
    upsellWeiterbindungHvVoice: { label: 'Upsell/Weiterbindung HV Voice', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufBbi: { label: 'Verkauf BBI', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufBbiA1Netz: { label: 'Verkauf BBI A1 Netz', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufBbiOanTpHc: { label: 'Verkauf BBI OAN/TP (HC)', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufBbiOanTpHp: { label: 'Verkauf BBI OAN/TP (HP)', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufFtthBbi: { label: 'Verkauf FTTH BBI', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufFwa: { label: 'Verkauf FWA', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufHausanschlussService: { label: 'Verkauf Hausanschluss + Service', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufHighValueVoice: { label: 'Verkauf High Value Voice', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufNetcube: { label: 'Verkauf Netcube', expectedInFTTH: false, expectedInBestandsbau: true },
    verkaufNext: { label: 'Verkauf Next', expectedInFTTH: false, expectedInBestandsbau: true },
    vorvertragOanTp: { label: 'Vorvertrag OAN/TP', expectedInFTTH: false, expectedInBestandsbau: true },
} as const;