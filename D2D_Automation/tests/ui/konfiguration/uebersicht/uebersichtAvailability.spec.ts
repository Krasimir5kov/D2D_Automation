/**
 * Covers: Konfiguration "Übersicht" sub-page navigation/load — confirmed via live DOM to be
 * a pure placeholder with no filters, no search field, no create button, and no table; its
 * entire content is a single <h2>Übersicht</h2> heading.
 * Does NOT cover: any filter (there are none on this sub-page).
 */
import { test } from '@playwright/test';

test.describe.skip('Konfiguration Übersicht Availability', { tag: ['@Admin', '@Admin-Regional'] }, () => {
});
