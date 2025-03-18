/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const allMainnetVotes = gql`
  query allMainnetVotes($argAddress: String!) {
		pollVotes(where: {voter: $argAddress}) {
      poll {
        id
      }
      choice
      blockTime
      txnHash
    }
  }
`;
