// Test IDs for Object Side Panel — POSS-3403
// Import this file in components and Playwright tests instead of using magic strings.
//
// Usage in component:
//   import { OBJECT_PANEL_IDS } from 'shared/testIds/objectPanel.ids';
//   <Button id={OBJECT_PANEL_IDS.neubau.questionnaireEditButton} />
//
// Usage in Playwright test:
//   import { OBJECT_PANEL_IDS } from 'shared/testIds/objectPanel.ids';
//   await page.locator(`#${OBJECT_PANEL_IDS.neubau.wrapper}`).click();

export const OBJECT_PANEL_IDS = {
  neubau: {
    // Panel wrapper
    wrapper: 'neubau-object-side-panel',
    ariaLabel: 'Object side panel',
    closeButton: 'neubau-object-side-panel-close-button',

    // Navigation
    goToSalesActionsButton: 'neubau-object-go-to-sales-actions-button',

    // Sales start edit form
    statusRadioGroup: 'neubau-object-status-radio-group',
    editCancelButton: 'neubau-object-edit-cancel-button',
    editApplyButton: 'neubau-object-edit-apply-button',

    // Note
    noteAddButton: 'neubau-object-note-add-button',
    noteEditButton: 'neubau-object-note-edit-button',
    noteDeleteButton: 'neubau-object-note-delete-button',
    noteCancelButton: 'neubau-object-note-cancel-button',
    noteSaveButton: 'neubau-object-note-save-button',
    noteSendToA1Checkbox: 'neubau-object-note-send-to-a1-checkbox',

    // Questionnaire
    questionnaireEditButton: 'neubau-object-questionnaire-edit-button',
    questionnaireCancelButton: 'neubau-object-questionnaire-cancel-button',
    questionnaireSaveButton: 'neubau-object-questionnaire-save-button',

    // D2D Sales tab — per sales action row (dynamic, requires DB id)
    doorSalesActionContextMenuButton: (salesActionId: number | string) =>
      `neubau-door-sales-action-context-menu-button-${salesActionId}`,
    doorSalesActionDetailViewButton: (salesActionId: number | string) =>
      `neubau-door-sales-action-detail-view-button-${salesActionId}`,
    doorSalesActionDeleteButton: (salesActionId: number | string) =>
      `neubau-door-sales-action-delete-button-${salesActionId}`
  },

  ftth: {
    // Panel wrapper
    wrapper: 'ftth-object-side-panel',
    ariaLabel: 'Object side panel',
    closeButton: 'ftth-object-side-panel-close-button',

    // Navigation
    goToSalesActionsButton: 'ftth-object-go-to-sales-actions-button',

    // Note
    noteAddButton: 'ftth-object-note-add-button',
    noteEditButton: 'ftth-object-note-edit-button',
    noteDeleteButton: 'ftth-object-note-delete-button',
    noteCancelButton: 'ftth-object-note-cancel-button',
    noteSaveButton: 'ftth-object-note-save-button'
  },

  bestandsbau: {
    // Panel wrapper
    wrapper: 'bestandsbau-object-side-panel',
    ariaLabel: 'Object side panel',
    closeButton: 'bestandsbau-object-side-panel-close-button',

    // Navigation
    goToSalesActionsButton: 'bestandsbau-object-go-to-sales-actions-button',

    // Note
    noteAddButton: 'bestandsbau-object-note-add-button',
    noteEditButton: 'bestandsbau-object-note-edit-button',
    noteDeleteButton: 'bestandsbau-object-note-delete-button',
    noteCancelButton: 'bestandsbau-object-note-cancel-button',
    noteSaveButton: 'bestandsbau-object-note-save-button'
  }
} as const;
