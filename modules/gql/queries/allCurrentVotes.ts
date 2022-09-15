import { gql } from 'graphql-request';

export const allCurrentVotes = gql`
  query allCurrentVotes($argAddress: String!) {
    allCurrentVotes(argAddress: $argAddress) {
      nodes {
        pollId
        optionIdRaw
        blockTimestamp
        chainId
        mkrSupport
        hash
      }
    }
  }
`;
