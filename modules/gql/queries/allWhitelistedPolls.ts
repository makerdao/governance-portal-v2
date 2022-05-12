import { gql } from 'graphql-request';

export const allWhitelistedPolls = gql`
  query activePolls($filter: ActivePollsRecordFilter) {
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
