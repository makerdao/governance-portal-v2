/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const delegatesQuery = gql`
  query delegates(
    $first: Int = 20
    $after: Cursor
    $orderBy: DelegateOrderByType
    $orderDirection: OrderDirectionType
    $includeExpired: Boolean
  ) {
    delegates(
      first: $first
      _first: $first
      after: $after
      orderBy: $orderBy
      orderDirection: $orderDirection
      includeExpired: $includeExpired
    ) {
      totalCount
      pageInfo {
        hasNextPage
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
