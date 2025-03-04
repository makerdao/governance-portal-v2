/*
SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { gql } from 'graphql-request';

export const delegatorHistory = gql`
  query delegatorHistory($address: String!) {
    delegationHistories(first: 1000, where: { delegator: $address }) {
      amount
      accumulatedAmount
      delegate {
        id
      }
      timestamp
      txnHash
      blockNumber
      isLockstake
    }
  }
`;
