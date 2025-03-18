/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { DefenderRelayProvider, DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { relayerCredentials } from '../helpers/relayerCredentials';

//Note that we'll get an error if we try to run this defender relay code on the frontend
//So we should only import this function on the backend
export const getArbitrumRelaySigner = (network: SupportedNetworks): DefenderRelaySigner => {
  if (!Object.values(SupportedNetworks).includes(network)) {
    throw new Error(`Unsupported network: ${network}`);
  }

  const provider = new DefenderRelayProvider(relayerCredentials[network]);

  const signer = new DefenderRelaySigner(relayerCredentials[network], provider, {
    speed: 'fastest' // 'safeLow' | 'average' | 'fast' | 'fastest'
  });

  return signer;
};
