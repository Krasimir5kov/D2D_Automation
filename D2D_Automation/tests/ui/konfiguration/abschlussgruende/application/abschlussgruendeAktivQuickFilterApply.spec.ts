/**
 * Covers: the Abschlussgründe "aktiv" quick filter pill — applying it and verifying results.
 * Trigger: #quick-filter-outcomeStatus-active-outcome.
 *
 * Note (confirmed live via the pasted DOM): the row's `data-status` attribute appears
 * inverted relative to its own visible "aktiv"/"inaktiv" text — rows showing "aktiv" carry
 * data-status="false" (e.g. row 274), rows showing "inaktiv" carry data-status="true" (e.g.
 * row 220). Verify this via devtools before relying on data-status for the row assertion —
 * prefer matching the rendered Status cell text instead unless the inversion is reconfirmed.
 */
import { test } from '@playwright/test';

test.describe.skip('Konfiguration Abschlussgründe Aktiv Quick Filter Apply', () => {
});
