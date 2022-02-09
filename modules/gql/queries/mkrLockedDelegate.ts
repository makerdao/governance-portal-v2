import { gql } from 'graphql-request';

export const mkrLockedDelegate = gql`
  query mkrLockedDelegate($argAddress: String!, $argUnixTimeStart: Int!, $argUnixTimeEnd: Int!) {
    mkrLockedDelegate(
      argAddress: $argAddress
      unixtimeStart: $argUnixTimeStart
      unixtimeEnd: $argUnixTimeEnd
    ) {
      nodes {
        fromAddress
        lockAmount
        blockNumber
        blockTimestamp
        lockTotal
        hash
      }
    }
  }
`;
