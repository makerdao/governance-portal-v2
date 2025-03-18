/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getMKRVotingWeight, MKRVotingWeightResponse } from 'modules/mkr/helpers/getMKRVotingWeight';
import { BigNumber } from 'ethers';
import logger from 'lib/logger';

export async function hasMkrRequiredVotingWeight(
  voter: string,
  network: SupportedNetworks,
  weight: BigNumber,
  canBeEqual = false
): Promise<boolean> {
  //verify address has a poll weight > weight param
  let hasMkrRequired = false;
  try {
    const pollWeight: MKRVotingWeightResponse = await getMKRVotingWeight(voter, network, false);
    hasMkrRequired = canBeEqual ? pollWeight.total.gte(weight) : pollWeight.total.gt(weight);
  } catch (err) {
    logger.error(err);
  }

  return hasMkrRequired;
}
