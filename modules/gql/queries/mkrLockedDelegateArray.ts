import { gql } from 'graphql-request';

export const mkrLockedDelegateArrayTotals = gql`
  query mkrLockedDelegateArrayTotalsV2($argAddress: [String]!, $argUnixTimeStart: Int!, $argUnixTimeEnd: Int!) {
    mkrLockedDelegateArrayTotals(
      argAddress: $argAddress
      unixtimeStart: $argUnixTimeStart
      unixtimeEnd: $argUnixTimeEnd
    ) {
      nodes {
        fromAddress
        immediateCaller
        delegateContractAddress
        lockAmount
        blockNumber
        blockTimestamp
        lockTotal
        callerLockTotal
        hash
      }
    }
  }
`;
