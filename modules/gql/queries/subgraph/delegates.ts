/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const delegatesQuery = gql`
query delegates($first: Int, $skip: Int, $orderBy: String, $orderDirection: String, $filter: Delegate_filter) {
    delegates(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection, where: $filter) {
      blockTimestamp
      blockNumber
      ownerAddress
      totalDelegated
      id
      delegators
      version
      voter {
        lastVotedTimestamp
      }
    }
  }  
`;
