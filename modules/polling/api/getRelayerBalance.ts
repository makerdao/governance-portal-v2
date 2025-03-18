/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatEther } from 'ethers/lib/utils';
import { getArbitrumRelaySigner } from './getArbitrumRelaySigner';
import logger from 'lib/logger';

export const getRelayerBalance = async (network: SupportedNetworks): Promise<string> => {
  try {
    if (!Object.values(SupportedNetworks).includes(network)) {
      throw new Error(`Unsupported network: ${network}`);
    }
    const signer = getArbitrumRelaySigner(network);
    const address = await signer.getAddress();
    const balance = await signer.provider.getBalance(address);

    return formatEther(balance);
  } catch (err) {
    logger.error(err);
    return '0';
  }
};
