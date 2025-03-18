/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { mainnetPublicClient, tenderly, tenderlyPublicClient } from 'modules/wagmi/config/config.default';
import { Abi } from 'viem';

export async function getSlateAddresses(
  chainId: number,
  address: `0x${string}`,
  abi: Abi,
  slateHash: `0x${string}`,
  i = 0
): Promise<string[]> {
  try {
    const publicClient = chainId === tenderly.id ? tenderlyPublicClient : mainnetPublicClient;

    return [
      await publicClient.readContract({ address, abi, functionName: 'slates', args: [slateHash, i] })
    ].concat(await getSlateAddresses(chainId, address, abi, slateHash, i + 1)) as string[];
  } catch (_) {
    return [];
  }
}
