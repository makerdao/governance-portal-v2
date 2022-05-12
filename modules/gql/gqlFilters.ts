import { QueryFilterNames } from './gql.constants';
import { PollsQuery, QueryFilterList } from './types';

export const queryFilters: QueryFilterList = {
  active: () => ({
    filter: { endDate: { greaterThanOrEqualTo: Math.floor(Date.now() / 1000) } }
  }),
  range: (start, end) => ({
    filter: {
      and: [{ startDate: { greaterThanOrEqualTo: start } }, { endDate: { lessThanOrEqualTo: end } }]
    }
  }),
  pollId: pollId => ({ filter: { pollId: { equalTo: pollId } } }),
  multiHash: multiHash => ({ filter: { multiHash: { startsWith: multiHash } } })
};

// TODO: I would like generalize this function so we don't have to use the switch, but I couldn't make typescript happy
export const getQueryFilter = (filterName: QueryFilterNames | undefined, ...args: any): PollsQuery | null => {
  if (filterName && queryFilters[filterName]) {
    switch (filterName) {
      case QueryFilterNames.Active:
        return queryFilters.active();

      case QueryFilterNames.Range:
        return queryFilters.range(args[0], args[1]);

      case QueryFilterNames.PollId:
        return queryFilters.pollId(args[0]);

      case QueryFilterNames.MultiHash:
        return queryFilters.multiHash(args[0]);

      default:
        break;
    }
  }
  return null;
};
