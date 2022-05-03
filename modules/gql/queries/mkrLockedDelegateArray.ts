import { gql } from 'graphql-request';

export const mkrLockedDelegateArrayTotals = gql`
  query mkrLockedDelegateArrayTotals($argAddress: [String]!, $argUnixTimeStart: Int!, $argUnixTimeEnd: Int!) {
    mkrLockedDelegateArrayTotals(
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
        callerLockTotal
        hash
      }
    }
  }
`;
