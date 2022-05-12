import { ActivePollsRecordFilter } from '../generated/graphql';

export type QueryFilterObject = Record<any, any>;
export type QueryFilter<T> = T;

// More filter types can be included here as we add them
export type PollsQuery = {
  filter: ActivePollsRecordFilter;
};

export type ActiveQueryFn = () => PollsQuery;
export type RangeQueryFn = (start: number, end: number) => PollsQuery;
export type PollIdQueryFn = (pollId: number) => PollsQuery;
export type MultiHashQueryFn = (multiHash: string) => PollsQuery;

export type QueryFilterList = {
  active: ActiveQueryFn;
  range: RangeQueryFn;
  pollId: PollIdQueryFn;
  multiHash: MultiHashQueryFn;
};
