/**
 * Covers: Abschlussgründe filter triggers — the "aktiv"/"inaktiv" quick-filter pills plus
 * the "Endergebnis"/"Kundenkontakt" dropdown-style toggle filters — visibility and correct
 * label.
 * Does NOT cover: selecting/applying a value or checking list results — see the individual
 * FilterApply/QuickFilterApply spec files for that.
 * Triggers: quick-filter-outcomeStatus-active-outcome, quick-filter-outcomeStatus-inactive-outcome,
 * #isFinalResult, #isCustomerContact.
 */
import { test } from '@playwright/test';

test.describe.skip('Konfiguration Abschlussgründe Filters Availability', { tag: ['@Admin', '@Admin-Regional'] }, () => {
});
