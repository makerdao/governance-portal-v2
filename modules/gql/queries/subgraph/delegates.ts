/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const delegatesQuerySubsequentPages = gql`
  query delegates(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $filter: Delegate_filter
  ) {
    delegates(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $filter
    ) {
      blockTimestamp
      blockNumber
      ownerAddress
      totalDelegated
      id
      delegators
      voter {
        lastVotedTimestamp
      }
    }
  }
`;

export const delegatesQueryFirstPage = gql`
  query delegates(
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: String
    $shadowFilter: Delegate_filter
    $alignedFilter: Delegate_filter
  ) {
    delegates(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $shadowFilter
    ) {
      blockTimestamp
      blockNumber
      ownerAddress
      totalDelegated
      id
      delegators
      voter {
        lastVotedTimestamp
      }
    }
    alignedDelegates: delegates(orderBy: $orderBy, orderDirection: $orderDirection, where: $alignedFilter) {
      blockTimestamp
      blockNumber
      ownerAddress
      totalDelegated
      id
      delegators
      voter {
        lastVotedTimestamp
      }
    }
  }
`;
