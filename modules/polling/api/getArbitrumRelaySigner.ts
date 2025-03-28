/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Relayer } from 'defender-relay-client';
import { relayerCredentials } from '../helpers/relayerCredentials';

//Note that we'll get an error if we try to run this defender relay code on the frontend
//So we should only import this function on the backend
export const getArbitrumRelaySigner = (network: SupportedNetworks): Relayer => {
  if (!Object.values(SupportedNetworks).includes(network)) {
    throw new Error(`Unsupported network: ${network}`);
  }

  return new Relayer(relayerCredentials[network]);
};
