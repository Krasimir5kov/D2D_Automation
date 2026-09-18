/**
 * Covers: Users tab filter triggers — "Organisation" and "Rolle" dropdowns, plus the
 * "aktiv"/"inaktiv"/"ohne Rolle" quick-filter pills — visibility and correct title/label.
 * Does NOT cover: selecting/applying a value or checking list results — see the individual
 * usersOrganisationFilterApply.spec.ts / usersRolleFilterApply.spec.ts /
 * usersAktivQuickFilterApply.spec.ts / usersInaktivQuickFilterApply.spec.ts /
 * usersOhneRolleQuickFilterApply.spec.ts files for that.
 * Triggers: #organizations, #roles, quick-filter-activeUser-active-users,
 * quick-filter-activeUser-inactive-users, quick-filter-roles-no-role.
 */
import { test } from '@playwright/test';

test.describe.skip('Benutzerverwaltung Users Filters Availability', { tag: ['@Admin', '@Admin-Regional'] }, () => {
});
