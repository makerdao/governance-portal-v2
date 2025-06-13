/*
SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>
SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { gql } from 'graphql-request';

export const delegationsFromAddressHistory = gql`
  query delegationsFromAddressHistory($delegator: String!) {
    delegationHistories(
      first: 1000
      where: { delegator: $delegator }
      orderBy: timestamp
      orderDirection: desc
    ) {
      amount
      accumulatedAmount
      delegator
      blockNumber
      timestamp
      txnHash
      delegate {
        id
      }
      isLockstake
    }
  }
`;
