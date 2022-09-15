import { gql } from 'graphql-request';

export const mkrDelegatedToV2 = gql`
  query mkrDelegatedToV2($argAddress: String!) {
    mkrDelegatedToV2(argAddress: $argAddress) {
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
