import { ActivePollsRecordFilter } from '../generated/graphql';

// More filter types can be included here as we add them
export type PollsQuery = {
  filter: ActivePollsRecordFilter;
};
