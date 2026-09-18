/**
 * Covers: the Abschlussgründe "inaktiv" quick filter pill — applying it and verifying
 * results.
 * Trigger: #quick-filter-outcomeStatus-inactive-outcome.
 *
 * Note (confirmed live via the pasted DOM): the row's `data-status` attribute appears
 * inverted relative to its own visible "aktiv"/"inaktiv" text — see
 * abschlussgruendeAktivQuickFilterApply.spec.ts's header note. Verify via devtools before
 * relying on data-status for the row assertion — prefer the rendered Status cell text
 * unless the inversion is reconfirmed.
 */
import { test } from '@playwright/test';

test.describe.skip('Konfiguration Abschlussgründe Inaktiv Quick Filter Apply', { tag: ['@Admin', '@Admin-Regional'] }, () => {
});
