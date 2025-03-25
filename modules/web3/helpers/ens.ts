/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from '../constants/networks';
import logger from 'lib/logger';
import { getPublicClient } from './getPublicClient';
import { normalize } from 'viem/ens';
import { networkNameToChainId } from './chain';

export async function getENS({
  address,
  network
}: {
  address: string;
  network: SupportedNetworks;
}): Promise<string | null> {
  try {
    const publicClient = getPublicClient(networkNameToChainId(network));
    const name = await publicClient.getEnsName({ address: address as `0x${string}` });
    return name;
  } catch (err) {
    logger.error(`getENS: ${address}. Unable to get ENS.`, err);
    return null;
  }
}

export async function resolveENS(ensName: string): Promise<string | null> {
  const publicClient = getPublicClient(networkNameToChainId(SupportedNetworks.MAINNET));

  try {
    const address = await publicClient.getEnsAddress({ name: normalize(ensName) });
    return address;
  } catch (err) {
    logger.error(`resolveENS: ${ensName}. Unable to resolve.`, err);
    return null;
  }
}
