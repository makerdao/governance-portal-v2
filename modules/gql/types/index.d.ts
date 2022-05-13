import { ActivePollsRecordFilter } from '../generated/graphql';

export type QueryFilterObject = Record<any, any>;
export type QueryFilter<T> = T;

// More filter types can be included here as we add them
export type PollsQuery = {
  filter: Partial<ActivePollsRecordFilter>;
};

export type ActiveQueryFn = () => PollsQuery;
export type RangeQueryFn = (start: number, end: number) => PollsQuery;
export type PollIdQueryFn = (pollId: number) => PollsQuery;
export type MultiHashQueryFn = (multiHash: string) => PollsQuery;

type ActiveGenFn = (endDate: number) => Partial<QueryActivePollsArgs>;
type PollIdGenFn = (pollId: number) => Partial<QueryActivePollsArgs>;
type RangeGenFn = (start: number, end: number) => Partial<QueryActivePollsArgs>;
type MultiHashGenFn = (multiHash: string) => Partial<QueryActivePollsArgs>;

type QueryFilterList = {
  active: ActiveGenFn;
  pollId: PollIdGenFn;
  range: RangeGenFn;
  multiHash: MultiHashGenFn;
};

type FilterName = keyof QueryFilterList;
