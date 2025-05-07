/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const delegateHistoryArray = gql`
  query delegateHistoryArray($delegates: [String!]!) {
    delegates(first: 1000, where: { id_in: $delegates, version: "3" }) {
      delegationHistory {
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
  }
`;
