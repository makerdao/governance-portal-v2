/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Contract } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getArbitrumRelaySigner } from './getArbitrumRelaySigner';
import { arbitrumSdkGenerators } from '../helpers/relayerCredentials';

//Note that we'll get an error if we try to run this defender relay code on the frontend
//So we should only import this function on the backend
export const getArbitrumPollingContractRelayProvider = async (
  network: SupportedNetworks
): Promise<Contract> => {
  if (!Object.values(SupportedNetworks).includes(network)) {
    throw new Error(`Unsupported network: ${network}`);
  }

  const signer = getArbitrumRelaySigner(network);

  const { polling } = arbitrumSdkGenerators[network](signer);

  return polling;
};
