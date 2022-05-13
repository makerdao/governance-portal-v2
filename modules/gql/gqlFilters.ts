import { FilterName, QueryFilterList } from './types';

const queryFilters: QueryFilterList = {
  active: endDate => ({ filter: { endDate: { greaterThanOrEqualTo: endDate } } }),
  pollId: pollId => ({ filter: { pollId: { equalTo: pollId } } }),
  range: (start, end) => ({
    filter: {
      and: [{ startDate: { greaterThanOrEqualTo: start } }, { endDate: { lessThanOrEqualTo: end } }]
    }
  }),
  multiHash: multiHash => ({ filter: { multiHash: { startsWith: multiHash } } })
};

export const getQueryFilter = <T extends FilterName>(filterName: T): QueryFilterList[T] => {
  const filtFn = queryFilters[filterName] as QueryFilterList[T];
  return filtFn;
};
