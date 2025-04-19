/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const allMainnetVoters = gql`
  query allMainnetVoters($argPollId: String) {
    pollVotes(where: { poll: $argPollId }) {
      id
      voter {
        id
      }
      blockTime
      choice
      txnHash
    }
  }
`;
