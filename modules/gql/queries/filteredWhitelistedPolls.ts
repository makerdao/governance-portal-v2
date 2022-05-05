import { gql } from 'graphql-request';

export const filteredWhitelistedPolls = gql`
  query ActivePolls($endDate: Int) {
    activePolls(filter: { endDate: { greaterThanOrEqualTo: $endDate } }) {
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
