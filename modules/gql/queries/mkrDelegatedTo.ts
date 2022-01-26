import { gql } from 'graphql-request';

export const mkrDelegatedTo = gql`
  query mkrDelegatedTo($argAddress: String!) {
    mkrDelegatedTo(argAddress: $argAddress) {
      nodes {
        fromAddress
        immediateCaller
        lockAmount
        blockNumber
        blockTimestamp
        hash
      }
    }
  }
`;
