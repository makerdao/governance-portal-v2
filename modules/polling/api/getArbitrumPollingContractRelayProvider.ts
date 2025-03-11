/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getArbitrumRelaySigner } from './getArbitrumRelaySigner';
import { pollingArbitrumAddress } from 'modules/contracts/generated';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { DefenderRelaySigner } from 'defender-relay-client/lib/ethers';

//Note that we'll get an error if we try to run this defender relay code on the frontend
//So we should only import this function on the backend
export const getArbitrumPollingContractRelayProvider = async (
  network: SupportedNetworks
): Promise<{ signer: DefenderRelaySigner; pollingAddress: `0x${string}` }> => {
  if (!Object.values(SupportedNetworks).includes(network)) {
    throw new Error(`Unsupported network: ${network}`);
  }

  const signer = getArbitrumRelaySigner(network);

  const chainId =
    network === SupportedNetworks.MAINNET
      ? networkNameToChainId(SupportedNetworks.ARBITRUM)
      : networkNameToChainId(SupportedNetworks.ARBITRUMTESTNET);
  const address = pollingArbitrumAddress[chainId];

  return { signer, pollingAddress: address };
};
