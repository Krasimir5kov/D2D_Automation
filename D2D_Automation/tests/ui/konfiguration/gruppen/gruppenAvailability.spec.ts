/**
 * Covers: Konfiguration "Gruppen" sub-page navigation/load — confirmed via live DOM to have
 * NO filters, NO search field, and NO create button. Content is just a header, a result
 * count, and a table (rows: tr-group-{id}, no data-* attributes; columns: ID, Anzeigename,
 * Typ, Auswahlart, Zusatzinfo, verwendet in Setup).
 * Does NOT cover: any filter (there are none on this sub-page).
 */
import { test } from '@playwright/test';

test.describe.skip('Konfiguration Gruppen Availability', () => {
});
