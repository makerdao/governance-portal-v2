import { gql } from 'graphql-request';

export const allDelegates = gql`
  query allDelegates {
    allDelegates {
      nodes {
        delegate
        voteDelegate
        blockTimestamp
      }
    }
  }
`;
