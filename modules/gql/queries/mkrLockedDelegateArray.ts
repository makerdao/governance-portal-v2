import { gql } from 'graphql-request';

export const mkrLockedDelegateArrayTotalsV2 = gql`
  query mkrLockedDelegateArrayTotalsV2(
    $argAddress: [String]!
    $argUnixTimeStart: Int!
    $argUnixTimeEnd: Int!
  ) {
    mkrLockedDelegateArrayTotalsV2(
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
