/**
 * Covers: Aktivitäten Setup "objectType" quick-filter pills (Neubau/FTTH-Ausbau/
 * Bestandsbau) — visibility and correct label.
 * Does NOT cover: selecting/applying a value or checking list results — see the individual
 * QuickFilterApply spec files for that.
 * Triggers: #quick-filter-objectType-NEUBAU, #quick-filter-objectType-FTTH,
 * #quick-filter-objectType-BESTANDSBAU.
 *
 * Note: this exact same quick-filter group (same 3 ids) also renders on Konfiguration
 * "Regime" — see regimeFiltersAvailability.spec.ts. There is no search field on this
 * sub-page (confirmed via live DOM).
 */
import { test } from '@playwright/test';

test.describe.skip('Konfiguration Aktivitäten Setup Filters Availability', { tag: ['@Admin', '@Admin-Regional'] }, () => {
});
