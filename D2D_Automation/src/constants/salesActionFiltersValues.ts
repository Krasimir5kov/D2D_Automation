import { SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS } from './salesActionsTableChipColors';

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
// expectChipDisplayed: confirmed 2026-09-16 — Pre-Contracting/2nd Run both render a Phase
// chip (list view + side panel); Keine Phase renders none anywhere, same "no chip for the
// null case" behavior already confirmed on the Baulose Phase filter.
export const phaseFilterOptions = {
    preContracting: { label: 'Pre-Contracting', expectChipDisplayed: true },
    secondRun: { label: '2nd Run', expectChipDisplayed: true },
    noPhase: { label: 'Keine Phase', expectChipDisplayed: false },
} as const;
export const KundendatenFilterOptions = {
    noCustomer: { label: 'ohne Kundendaten', expectedIconPresent: false, expectedInNeubau: true, expectedInFTTH: true, expectedInBestandsbau: true },
    withCustomer: { label: 'mit Kundendaten', expectedIconPresent: true, expectedInNeubau: false, expectedInFTTH: true, expectedInBestandsbau: true },
} as const;
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

export const regimeFilterOptions = {
    vhcn: { label: 'VHCN', expectedInNeubau: false, expectedInFTTH: true, expectedInBestandsbau: false },
    zag: { label: 'ZAG', expectedInNeubau: false, expectedInFTTH: true, expectedInBestandsbau: false },
    fttb: { label: 'FTTB', expectedInNeubau: false, expectedInFTTH: false, expectedInBestandsbau: true },
    fttc: { label: 'FTTC', expectedInNeubau: false, expectedInFTTH: false, expectedInBestandsbau: true },
    wbtmBestand: { label: 'WBTM Bestand', expectedInNeubau: true, expectedInFTTH: false, expectedInBestandsbau: false },
    wbtmNeubau: { label: 'WBTM Neubau', expectedInNeubau: true, expectedInFTTH: false, expectedInBestandsbau: false }
} as const;
// Confirmed 2026-09-15 via live row DOM: data-status-value="NOT_EXECUTABLE" renders
// role="status" text "nicht durchführbar" - matches SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS
// exactly. "offen" (OPEN) is confirmed as the row's rendered text but has no confirmed
// background color yet, so it's checked label-only (no color assertion) below. CARRIED_OUT's
// German label is not yet confirmed at all, so it's deliberately left out rather than guessed.
export const salesActionStatusOptions = {
    offen: { chipLabel: 'offen' , listChipLabel: 'offen' , color: SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.offen.color },
    inBearbeitung: { chipLabel: 'in Bearbeitung' , listChipLabel: 'in Bearbeitung' , color: SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.inbearbeitung.color },
    abgeschlossenPositiv: { chipLabel: 'abgeschlossen - positiv' , listChipLabel: 'abgeschlossen' , color: SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.abgeschlossenPositive.color},
    abgeschlossenNegativ: { chipLabel: 'abgeschlossen - negativ' , listChipLabel: 'abgeschlossen' , color: SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.abgeschlossenNegative.color },
    durchgefuehrt: { chipLabel: 'durchgeführt' , listChipLabel: 'durchgeführt' , color: SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.durchgeführt.color },
    nichtDurchfuehrbar: { chipLabel: 'nicht durchführbar' , listChipLabel: 'nicht durchführbar' , color: SALES_ACTIONS_TABLE_STATUS_CHIP_COLORS.nichtdurchführbar.color }

} as const;
export const terminFilterOptions = {
    Termin: { label: 'Termin' },
    ohneTermin: { label: 'ohne Termin' },
    mitTermin: { label: 'mit Termin' },
    mitTerminHeute: { label: 'mit Termin heute' },
    mitTerminImZeitraum: { label: 'mit Termin im Zeitraum' },
};
// Confirmed 2026-09-16 by the user. Two dropdown groups: "Objekt Sales Action" entries
// are advertising/marketing sales actions with NO customer interaction at all - not even
// the usual ÜBERSICHT/AKTIVITÄTEN/etc. side panel tabs. "D2D Sales Action" entries do have
// customer interaction + those tabs. Only d2dVerkauf is wired into a test today (the
// Termin filter's Neubau sampling, to exclude Objekt Sales Action rows first) - the rest
// are recorded now for later reuse, not yet wired into anything.
// Also confirmed: on BESTANDSBAU, a d2dVerkauf sales action automatically becomes
// a1InternetReadyCheck once it receives a Termin - a system-driven type change, not a
// manual one. Relevant to the BESTANDSBAU "ohne Termin" fixme in
// salesActionsTerminFilterApply.spec.ts.
export const salesActionTypeFilterOptions = {
    // Objekt Sales Action group
    bautraegerUebergabemappe: { label: 'Bauträger Übergabemappe' },
    mieterliste: { label: 'Mieterliste' },
    mietervorveranstaltung: { label: 'Mietervorveranstaltung' },
    salesPersonal: { label: 'Sales Personal' },
    tuerhaenger: { label: 'Türhänger' },
    verkaufsstand: { label: 'Verkaufsstand' },
    werbemittelmassnahmen: { label: 'Werbemittelmaßnahmen' },
    // D2D Sales Action group
    a1InternetReadyCheck: { label: 'A1 Internet Ready Check' },
    d2dVerkauf: { label: 'D2D Verkauf' },
} as const;