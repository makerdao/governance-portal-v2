/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const allArbitrumVotes = gql`
  query allArbitrumVotes($argAddress: String!, $startUnix: BigInt) {
		arbitrumPollVotes(where: {voter: $argAddress, blockTime_gt: $startUnix}, first: 1000) {
      poll {
        id
      }
      choice
      blockTime
      txnHash
    }
  }
`;
