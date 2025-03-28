/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getMKRVotingWeight, MKRVotingWeightResponse } from 'modules/mkr/helpers/getMKRVotingWeight';
import logger from 'lib/logger';

export async function hasMkrRequiredVotingWeight(
  voter: string,
  network: SupportedNetworks,
  weight: bigint,
  canBeEqual = false
): Promise<boolean> {
  //verify address has a poll weight > weight param
  let hasMkrRequired = false;
  try {
    const pollWeight: MKRVotingWeightResponse = await getMKRVotingWeight(voter, network, false);
    hasMkrRequired = canBeEqual ? pollWeight.total >= weight : pollWeight.total > weight;
  } catch (err) {
    logger.error(err);
  }

  return hasMkrRequired;
}
