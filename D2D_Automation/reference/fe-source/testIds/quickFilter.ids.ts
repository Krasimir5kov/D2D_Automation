export const QUICK_FILTER_IDS = {
  container: (filterId: string): string => `quick-filter-${filterId}`,
  pill: (filterId: string, choiceId: string): string => `quick-filter-${filterId}-${choiceId}`,
  clearAllFiltersButton: 'clear-all-applied-filters-button'
} as const;
