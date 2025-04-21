/*
SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>
SPDX-License-Identifier: AGPL-3.0-or-later
*/

import { gql } from 'graphql-request';

export const allSpellVotes = gql`
    query allSpellVotes($argSkip: Int, $argFirst: Int) {executiveVotesV2(first: $argFirst, skip: $argSkip, orderBy: id, orderDirection: desc) {
    	blockTime
        spell {
    	  id
    	}
      voter{
        id
        v2VotingPowerChanges(first: 1, orderDirection: desc, orderBy: blockTimestamp) {
      	newBalance
      }
      }
    }
    }
`;
