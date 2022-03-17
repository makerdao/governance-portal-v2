import { gql } from 'graphql-request';

export const mkrLockedDelegateArray = gql`
  query mkrLockedDelegateArray($argAddress: [String]!, $argUnixTimeStart: Int!, $argUnixTimeEnd: Int!) {
    mkrLockedDelegateArray(
      argAddress: $argAddress
      unixtimeStart: $argUnixTimeStart
      unixtimeEnd: $argUnixTimeEnd
    ) {
      nodes {
        fromAddress
        immediateCaller
        lockAmount
        blockNumber
        blockTimestamp
        lockTotal
        hash
      }
    }
  }
`;
