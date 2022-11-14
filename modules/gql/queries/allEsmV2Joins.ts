import { gql } from 'graphql-request';

export const allEsmV2Joins = gql`
  query allEsmV2Joins {
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
