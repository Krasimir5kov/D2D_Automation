export const plzOptions = [
    'PLZ - Bereich',
    'exakte PLZ'
];

// Confirmed live — radio-based, same custom-radio a11y bug/workaround as PLZ (choiceRadio()).
export const fragebogenOptions = [
    'vollständig',
    'unvollständig'
];

// UNCONFIRMED — never independently verified via devtools. Both the control type (assumed
// radio, by analogy with PLZ/Fragebogen reusing the same styled-radio component) and these
// exact labels are guesses from an earlier investigation note. Confirm before trusting this.
// maxDaysFromToday is cumulative/inclusive of today — "6 Wochen" (42 days) also covers every
// date that "8 Tage" (8 days) would, confirmed 2026-09-08.
export const verkaufsstartTerminOptions = {
    next8Days: { label: 'in den nächsten 8 Tagen', maxDaysFromToday: 8 },
    next6Weeks: { label: 'in den nächsten 6 Wochen', maxDaysFromToday: 42 },
} as const;
export const verkaufsstartStatusSectionOptions = {
    advanceNotice: 'vor Aviso',
    confirmed: 'Bestätigt',
    firstAppointment: 'Ersttermin',
} as const;