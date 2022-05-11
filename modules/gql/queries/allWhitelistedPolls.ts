import { gql } from 'graphql-request';

export const allWhitelistedPolls = gql`
  query ActivePolls($filter: ActivePollsRecordFilter) {
    activePolls(filter: $filter) {
      nodes {
        creator
        pollId
        blockCreated
        startDate
        endDate
        multiHash
        url
      }
    }
  }
`;
