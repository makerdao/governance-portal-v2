/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { gql } from 'graphql-request';

export const votingWeightHistory = gql`
  query VotingWeightHistory($argAddress: String){
    executiveVotingPowerChangesV2(where: {voter: $argAddress}){
			blockTimestamp
      newBalance
    }
    }
`;
