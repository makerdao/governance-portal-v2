import { gql } from 'graphql-request';

export const lastPollVote = gql`
  query lastPollVote($argAddress: String!) {
    allCurrentVotes(argAddress: $argAddress, first: 1) {
      nodes {
        pollId
        optionId
        optionIdRaw
        blockTimestamp
        mkrSupport
        hash
      }
    }
  }
`;
