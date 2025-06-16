/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const allDelegateAddresses = gql`
  query allDelegateAddresses($first: Int = 1000, $skip: Int = 0) {
    delegates(first: $first, skip: $skip, orderBy: blockTimestamp, orderDirection: asc) {
      id
      ownerAddress
      blockTimestamp
      version
    }
  }
`;