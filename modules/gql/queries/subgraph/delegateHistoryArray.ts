/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const delegateHistoryArray = gql`
query delegateHistoryArray($delegates: [String!]!) {
  delegates(where: {id_in: $delegates}) {
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
    }
  }
}
`;
