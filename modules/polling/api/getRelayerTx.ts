/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Relayer } from '@openzeppelin/defender-relay-client';
import { relayerCredentials } from '../helpers/relayerCredentials';

export const getRelayerTx = async (
  txId: string,
  network: SupportedNetworks
): Promise<any> /* type this to relayer tx */ => {
  const relayer = new Relayer(relayerCredentials[network]);
  const latestTx = await relayer.query(txId);

  return latestTx;
};
