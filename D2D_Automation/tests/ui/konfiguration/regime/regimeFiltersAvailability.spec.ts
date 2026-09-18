/**
 * Covers: Regime "objectType" quick-filter pills (Neubau/FTTH-Ausbau/Bestandsbau) —
 * visibility and correct label.
 * Does NOT cover: selecting/applying a value or checking list results — see the individual
 * QuickFilterApply spec files for that.
 * Triggers: #quick-filter-objectType-NEUBAU, #quick-filter-objectType-FTTH,
 * #quick-filter-objectType-BESTANDSBAU.
 *
 * Note: this exact same quick-filter group (same 3 ids) also renders on Konfiguration
 * "Aktivitäten Setup" — see aktivitaetenSetupFiltersAvailability.spec.ts. Also note (per
 * FilterConfigContext.tsx source): this filter is role-gated to ADMIN_A1/ADMIN_A1_REGION —
 * confirm the automation's test user has one of those roles before writing real assertions,
 * otherwise the pills won't render at all.
 */
import { test } from '@playwright/test';

test.describe.skip('Konfiguration Regime Filters Availability', { tag: ['@Admin', '@Admin-Regional'] }, () => {
});
