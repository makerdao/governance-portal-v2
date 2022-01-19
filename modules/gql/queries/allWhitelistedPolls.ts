import { gql } from 'graphql-request';

export const allWhitelistedPolls = gql`
  {
    activePolls {
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
