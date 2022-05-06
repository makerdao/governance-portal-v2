export const queryFilters = {
  active: { filter: { endDate: { greaterThanOrEqualTo: Math.floor(Date.now() / 1000) } } }
};
export const getQueryFilter = (filterName: string | undefined) => {
  if (!filterName) return null;
  return queryFilters[filterName];
};
