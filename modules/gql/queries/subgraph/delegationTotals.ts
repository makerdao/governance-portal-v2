/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const delegationTotalsQuery = gql`
  query delegationTotals($skip: Int!) {
    delegates(where: {version_in: ["1", "2"]}, first: 1000, skip: $skip){
      delegations(first: 1000, where: {delegator_not_in: ["0x2b16c07d5fd5cc701a0a871eae2aad6da5fc8f12"]}){
        amount
      }
    }
  }
`;
