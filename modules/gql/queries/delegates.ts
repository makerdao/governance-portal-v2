/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const delegatesQuery = gql`
  query delegates(
    $first: Int = 20
    $offset: Int
    $after: Cursor
    $orderBy: DelegateOrderByType
    $orderDirection: OrderDirectionType
    $includeExpired: Boolean
    $seed: Float
    $filter: DelegateEntryFilter
    $constitutionalDelegates: [String]
  ) {
    delegates(
      first: $first
      _first: $first
      offset: $offset
      after: $after
      orderBy: $orderBy
      orderDirection: $orderDirection
      includeExpired: $includeExpired
      seed: $seed
      filter: $filter
      constitutionalDelegates: $constitutionalDelegates
    ) {
      totalCount
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
      nodes {
        delegate
        voteDelegate
        creationDate
        expirationDate
        expired
        lastVoted
        delegatorCount
        totalMkr
      }
    }
  }
`;
