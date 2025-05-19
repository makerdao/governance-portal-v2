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
      delegations(
        first: 1000
        where: {delegator_not_in: ["0xce01c90de7fd1bcfa39e237fe6d8d9f569e8a6a3", "0xb1fc11f03b084fff8dae95fa08e8d69ad2547ec1"]}
      ) {
        amount
      }
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
      delegations(
        first: 1000
        where: {delegator_not_in: ["0xce01c90de7fd1bcfa39e237fe6d8d9f569e8a6a3", "0xb1fc11f03b084fff8dae95fa08e8d69ad2547ec1"]}
      ) {
        amount
      }
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
      delegations(
        first: 1000
        where: {delegator_not_in: ["0xce01c90de7fd1bcfa39e237fe6d8d9f569e8a6a3", "0xb1fc11f03b084fff8dae95fa08e8d69ad2547ec1"]}
      ) {
        amount
      }
      id
      delegators
      voter {
        lastVotedTimestamp
      }
    }
  }
`;
