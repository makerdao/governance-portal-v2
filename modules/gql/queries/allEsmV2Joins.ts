import { gql } from 'graphql-request';

export const allEsmV2Joins = gql`
  {
    allEsmV2Joins {
      nodes {
        txFrom
        txHash
        joinAmount
        blockTimestamp
      }
    }
  }
`;
