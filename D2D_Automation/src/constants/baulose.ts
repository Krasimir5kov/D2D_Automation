// Bestandsbau and FTTH render different table column layouts — never assume the same
// index means the same thing in both. Confirmed live via devtools, 2026-08-11.
export const BESTANDSBAU_COLUMNS = {
  nameAndRegime: 0,
  organisation: 1,
  status: 2,
  importDate: 3,
  anzahl: 4,
} as const;

export const FTTH_COLUMNS = {
  nameAndRegime: 0,
  organisationAndPhase: 1,
  status: 2,
  preContracting: 3,
  secondRun: 4,
  anzahl: 5,
} as const;
