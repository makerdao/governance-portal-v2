/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getSKYVotingWeight, SKYVotingWeightResponse } from 'modules/sky/helpers/getSKYVotingWeight';
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
    const pollWeight: SKYVotingWeightResponse = await getSKYVotingWeight(voter, network, false);
    hasMkrRequired = canBeEqual ? pollWeight >= weight : pollWeight > weight;
  } catch (err) {
    logger.error(err);
  }

  return hasMkrRequired;
}
