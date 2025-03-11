/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatEther } from 'viem';
import { getArbitrumRelaySigner } from './getArbitrumRelaySigner';
import logger from 'lib/logger';
import { getGaslessPublicClient } from 'modules/web3/helpers/getPublicClient';
import { networkNameToChainId } from 'modules/web3/helpers/chain';

export const getRelayerBalance = async (network: SupportedNetworks): Promise<string> => {
  try {
    if (!Object.values(SupportedNetworks).includes(network)) {
      throw new Error(`Unsupported network: ${network}`);
    }

    const signer = getArbitrumRelaySigner(network);
    const gaslessPublicClient = getGaslessPublicClient(networkNameToChainId(network));

    const address = await signer.getAddress();
    const balance = await gaslessPublicClient.getBalance({ address: address as `0x${string}` });

    return formatEther(balance);
  } catch (err) {
    logger.error(err);
    return '0';
  }
};
