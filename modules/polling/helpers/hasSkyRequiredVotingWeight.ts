/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getSKYVotingWeight, SKYVotingWeightResponse } from 'modules/sky/helpers/getSKYVotingWeight';
import logger from 'lib/logger';

export async function hasSkyRequiredVotingWeight(
  voter: string,
  network: SupportedNetworks,
  weight: bigint,
  canBeEqual = false
): Promise<boolean> {
  //verify address has a poll weight > weight param
  let hasSkyRequired = false;
  try {
    const pollWeight: SKYVotingWeightResponse = await getSKYVotingWeight(voter, network, false);
    hasSkyRequired = canBeEqual ? pollWeight >= weight : pollWeight > weight;
  } catch (err) {
    logger.error(err);
  }

  return hasSkyRequired;
}
