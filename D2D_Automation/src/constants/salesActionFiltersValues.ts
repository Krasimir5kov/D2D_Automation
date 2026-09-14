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
export const phaseFilterOptions = {
    preContracting: 'Pre-Contracting',
    secondRun: '2nd Run',
    noPhase: 'Keine Phase',
};
export const KundendatenFilterOptions = {
    noCustomer: { label: 'ohne Kundendaten', expectedIconPresent: false, expectedInNeubau: true, expectedInFTTH: true, expectedInBestandsbau: true },
    withCustomer: { label: 'mit Kundendaten', expectedIconPresent: true, expectedInNeubau: false, expectedInFTTH: true, expectedInBestandsbau: true },
} as const;
;
// Confirmed 2026-09-04: only leerverrohrungscheck and nachverdichtung return results in
// FTTH-AUSBAU — every other Aufgabe value here is Bestandsbau-specific.
export const aufgabeFilterOptions = {
    bbiZuNetcube: { label: 'BBI zu Netcube', expectedInFTTH: false, expectedInBestandsbau: true },
    kupferZuGlasfaserA1Netz: { label: 'Kupfer zu Glasfaser A1 Netz', expectedInFTTH: false, expectedInBestandsbau: true },
    leerverrohrungscheck: { label: 'Leerverrohrungscheck', expectedInFTTH: true, expectedInBestandsbau: false },
    level0AblegerOeffentl: { label: 'Level 0 (Ableger öffentl)', expectedInFTTH: false, expectedInBestandsbau: true },
    level1AblegerPriv: { label: 'Level 1 (Ableger priv)', expectedInFTTH: false, expectedInBestandsbau: true },
    level3GfImHausOhneAbschlusspunkt: { label: 'Level 3 (GF im Haus ohne Abschlusspunkt)', expectedInFTTH: false, expectedInBestandsbau: true },
    level4GfImWohnbereich: { label: 'Level 4 (GF im Wohnbereich)', expectedInFTTH: false, expectedInBestandsbau: true },
    nachverdichtung: { label: 'Nachverdichtung', expectedInFTTH: true, expectedInBestandsbau: false },
    netcubeZuBbi: { label: 'Netcube zu BBI', expectedInFTTH: false, expectedInBestandsbau: true },
    netcubeZuBbiA1Netz: { label: 'Netcube zu BBI A1 Netz', expectedInFTTH: false, expectedInBestandsbau: true },
    vorvertragOanTp: { label: 'Vorvertrag OAN/TP', expectedInFTTH: false, expectedInBestandsbau: true },
} as const;
export const immobilienartFilterOptions = {
    einfamilienhaus: { label: 'Einfamilienhaus', expectedInFTTH: true, expectedInBestandsbau: false, expectedNEUBAU: false },
    mehrgeschoßigerWohnbau: { label: 'mehrgeschoßiger Wohnbau', expectedInFTTH: true, expectedInBestandsbau: false, expectedNEUBAU: true },
    unbekannt: { label: 'unbekannt', expectedInFTTH: true, expectedInBestandsbau: true, expectedNEUBAU: false },
};