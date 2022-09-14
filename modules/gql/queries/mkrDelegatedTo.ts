import { gql } from 'graphql-request';

export const mkrDelegatedTo = gql`
  query mkrDelegatedToV2($argAddress: String!) {
    mkrDelegatedTo(argAddress: $argAddress) {
      nodes {
        fromAddress
        immediateCaller
        delegateContractAddress
        lockAmount
        blockNumber
        blockTimestamp
        hash
      }
    }
  }
`;
