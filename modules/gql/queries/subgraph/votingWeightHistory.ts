/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const votingWeightHistory = gql`
  query VotingWeightHistory($argAddress: String, $argStartUnix: BigInt){
    executiveVotingPowerChanges(where: {blockTimestamp_gte: $argStartUnix, voter: $argAddress}){
			blockTimestamp
      newBalance
    }
    }
`;
