/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const delegationTotalsQuery = gql`
  query delegationTotals($skip: Int!) {
    delegates(first: 1000, skip: $skip) {
      version
      totalDelegated
    }
  }
`;
