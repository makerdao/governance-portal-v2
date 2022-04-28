import { gql } from 'graphql-request';

export const allLocksSummed = gql`
  query allLocksSummed($unixtimeStart: Int!, $unixtimeEnd: Int!) {
    allLocksSummed(unixtimeStart: $unixtimeStart, unixtimeEnd: $unixtimeEnd) {
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
