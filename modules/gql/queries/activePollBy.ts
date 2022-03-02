import { gql } from 'graphql-request';

export const activePollById = gql`
  query activePollById($argPollId: Int!) {
    activePollById(argPollId: $argPollId) {
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

export const activePollByMultihash = gql`
  query activePollByMultihash($argPollMultihash: String!) {
    activePollByMultihash(argPollMultihash: $argPollMultihash) {
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
