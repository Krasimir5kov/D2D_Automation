import type { ContractSection } from '../../../shared/types/Object/Object.type';

export const BAULOSE_IDS = {
  salesActionsLink: (type: string, contractSection: ContractSection): string =>
    `sales-actions-link-${type.toLowerCase()}-${contractSection.id}-${contractSection.ftthId ?? ''}`,
  pageNavigator: (type: string): string => `page-navigator-${type}`,
  tableRow: (id: string | number, ftthId?: string | null): string => `${id}-${ftthId ?? ''}`
} as const;
