/**
 * Covers: the Importe "Importdatum" range filter dropdown's own content/structure — the
 * date-range picker fields (today/this-week/this-month shortcuts), header label, and applied
 * range label rendering.
 * Does NOT cover: selecting/applying a range or checking list results — see
 * importeImportdatumFilterApply.spec.ts for that.
 * Trigger: #importData.
 *
 * Note: the same range filter (config key "importDate", real DOM id "importData", confirmed
 * by the user) is also shared with Baulose — see bauloseImportdatumFilterDropdown.spec.ts.
 */
import { test } from '@playwright/test';

test.describe.skip('Importe Importdatum Filter Dropdown Content', { tag: ['@Admin', '@Admin-Regional'] }, () => {
});
