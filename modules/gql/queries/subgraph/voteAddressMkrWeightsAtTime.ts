/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

//TODO: update this to get 1 entry per voter, not just one entry per query
export const voteAddressMkrWeightsAtTime = gql`
  query voteAddressMkrWeightsAtTime($argVoters: [String!]!, $argUnix: BigInt!) {
    executiveVotingPowerChanges(
      first: 1, 
      orderBy: blockTimestamp, 
      orderDirection: desc, 
      where: { blockTimestamp_lte: $argUnix, voter_in: $argVoters }
    ) {
      voter {
        id
      }
      newBalance
      blockTimestamp
    }
  }
`;
