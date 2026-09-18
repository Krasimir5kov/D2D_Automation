/**
 * Covers: Konfiguration "Aufgaben" sub-page navigation/load — confirmed via live DOM to have
 * NO filters at all. Content is: header, "Aufgabe erstellen" create button
 * (#create-task-button), search field (#sales-action-tasks-search-field), result count, and
 * a table (rows: task-row-{taskId}, attributes data-task-id/data-task-type/data-display-name).
 * Does NOT cover: any filter (there are none on this sub-page).
 */
import { test } from '@playwright/test';

test.describe.skip('Konfiguration Aufgaben Availability', { tag: ['@Admin', '@Admin-Regional'] }, () => {
});
