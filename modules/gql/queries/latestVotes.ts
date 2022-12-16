import { gql } from 'graphql-request';

export const latestVotes = gql`
    query allCurrentVotes($first: Number!, $offset: Number!) {
    allCurrentVotes(first: $first, offset: $offset, orderBy: pollId, orderDirection: desc) {
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
