export const IMPORTS_IDS = {
  tableRow: (importId: number | string): string => `import-row-${importId}`,
  tableRowImportCell: (importId: number | string): string => `import-${importId}-col-import`,
  tableRowImportedBy: (importId: number | string): string => `import-${importId}-imported-by`,
  tableRowBaulosCell: (importId: number | string): string => `import-${importId}-col-baulos`,
  tableRowBaulosName: (importId: number | string): string => `import-${importId}-baulos-name`,
  tableRowOrganisationCell: (importId: number | string): string => `import-${importId}-col-organisation`,
  tableRowOrganisationName: (importId: number | string): string => `import-${importId}-organisation-name`,
  tableRowStatusTag: (importId: number | string): string => `import-${importId}-status`,
  revertButton: (importId: number | string): string => `import-${importId}-revert-button`,
  pagination: 'imports-pagination',
  revertModal: (importId: number | string): string => `import-${importId}-revert-modal`,
  revertModalCancelButton: (importId: number | string): string => `import-${importId}-revert-cancel-button`,
  revertModalDeleteButton: (importId: number | string): string => `import-${importId}-revert-delete-button`,
  revertModalCloseButton: (importId: number | string): string => `import-${importId}-revert-close-button`
} as const;

export const IMPORTS_ACTIONS_IDS = {
  changeOrganizationButton: 'imports-change-organization-button',
  changeOrganizationModal: 'change-organization-modal',
  changeOrganizationCancelButton: 'change-organization-cancel-button',
  changeOrganizationConfirmButton: 'change-organization-confirm-button',
  importDataButton: 'imports-import-data-button',
  importDataModal: 'import-data-modal',
  importDataCancelButton: 'import-data-cancel-button',
  fileUploader: 'imports-file-uploader'
} as const;
