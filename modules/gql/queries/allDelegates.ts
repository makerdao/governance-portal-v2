import { gql } from 'graphql-request';

export const allDelegates = gql`
  {
    allDelegates {
      nodes {
        delegate
        voteDelegate
        blockTimestamp
      }
    }
  }
`;
