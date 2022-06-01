import { FilterNames, PollsQueryVariables, QueryFilterList } from './types';

const queryFilters: QueryFilterList = {
  active: ({ endDate }) => ({ filter: { endDate: { greaterThanOrEqualTo: endDate } } }),
  pollId: ({ pollId }) => ({ filter: { pollId: { equalTo: pollId } } }),
  range: ({ start, end }) => ({
    filter: {
      and: [{ startDate: { greaterThanOrEqualTo: start } }, { endDate: { lessThanOrEqualTo: end } }]
    }
  }),
  multiHash: ({ multiHash }) => ({ filter: { multiHash: { startsWith: multiHash } } })
};

type ParameterOpts<T> = T extends (arg: infer T) => any ? T : never;

export const getQueryFilter = <T extends FilterNames>(
  filterName: T,
  options: ParameterOpts<QueryFilterList[T]>
): PollsQueryVariables => {
  const filterGenerator = queryFilters[filterName] as QueryFilterList[T];
  return filterGenerator(options as any);
};
