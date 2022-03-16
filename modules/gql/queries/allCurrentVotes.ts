import { gql } from 'graphql-request';

export const allCurrentVotes = gql`
  query allCurrentVotes($argAddress: String!) {
    allCurrentVotes(argAddress: $argAddress) {
      nodes {
        pollId
        optionId
        optionIdRaw
        blockTimestamp
      }
    }
  }
`;

export const lastPollVote = gql`
  query allCurrentVotes($argAddress: String!) {
    allCurrentVotes(argAddress: $argAddress, first: 1) {
      nodes {
        pollId
        optionId
        optionIdRaw
        blockTimestamp
      }
    }
  }
`;
