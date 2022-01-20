import { gql } from 'graphql-request';

export const allEsmJoins = gql`
  {
    allEsmJoins {
      nodes {
        txFrom
        txHash
        joinAmount
        blockTimestamp
      }
    }
  }
`;
