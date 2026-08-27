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
export const verkaufsstartOptions = [
    '8 Tage',
    '6 Wochen'
];