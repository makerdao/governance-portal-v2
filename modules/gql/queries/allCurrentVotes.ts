import { gql } from 'graphql-request';

export const allCurrentVotes = gql`
  query allCurrentVotes(
    $first: Int
    $before: Cursor
    $last: Int
    $after: Cursor
    $offset: Int
    $filter: AllCurrentVotesRecordFilter
    $argAddress: String!
  ) {
    allCurrentVotes(
      first: $first
      before: $before
      last: $last
      after: $after
      offset: $offset
      filter: $filter
      argAddress: $argAddress
    ) {
      edges {
        node {
          pollId
          optionIdRaw
          blockTimestamp
          chainId
          mkrSupport
          hash
        }
        cursor
      }
    }
  }
`;
