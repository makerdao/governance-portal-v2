import { gql } from 'graphql-request';

export const allWhitelistedPolls = gql`
  query activePolls(
    $first: Int
    $before: Cursor
    $last: Int
    $after: Cursor
    $offset: Int
    $filter: ActivePollsRecordFilter
  ) {
    activePolls(
      first: $first
      before: $before
      last: $last
      after: $after
      offset: $offset
      filter: $filter
    ) {
      edges {
        node {
          creator
          pollId
          blockCreated
          startDate
          endDate
          multiHash
          url
        }
        cursor
      }
    }
  }
`;
