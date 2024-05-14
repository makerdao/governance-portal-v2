/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Contract } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getGaslessProvider } from 'modules/web3/helpers/chain';
import { arbitrumSdkGenerators } from './relayerCredentials';

export const getArbitrumPollingContractReadOnly = (network: SupportedNetworks): Contract => {
  if (!Object.values(SupportedNetworks).includes(network)) {
    throw new Error(`Unsupported network: ${network}`);
  }
  const gaslessProvider = getGaslessProvider(network);
  const { polling } = arbitrumSdkGenerators[network](gaslessProvider);
  return polling;
};
