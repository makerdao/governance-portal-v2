/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from '../helpers/chain';
import contractInfo from '../helpers/contract-info.json';
import { getPublicClient } from '../helpers/getPublicClient';
import { dssSpellAbi, pauseAbi, pauseAddress } from 'modules/contracts/generated';
const pauseInfo = contractInfo.pause;

export const getSpellExecutionDate = async (
  spellAddress: string,
  network?: SupportedNetworks
): Promise<Date | undefined> => {
  const chainId = networkNameToChainId(network || DEFAULT_NETWORK.network);
  const publicClient = getPublicClient(chainId);

  const done = await publicClient.readContract({
    address: spellAddress as `0x${string}`,
    abi: dssSpellAbi,
    functionName: 'done'
  });

  if (!done) return undefined;

  const string = spellAddress.replace(/^0x/, '');

  const paddedSpellAddress = '0x' + string.padStart(64, '0');

  const [execEvent] = await publicClient.getLogs({
    fromBlock: BigInt(pauseInfo.inception_block[network || DEFAULT_NETWORK.network]),
    toBlock: 'latest',
    address: pauseAddress[chainId],
    event: pauseAbi[1],
    args: { sig: pauseInfo.events.exec as `0x${string}`, guy: paddedSpellAddress as `0x${string}` }
  });

  const { timestamp } = await publicClient.getBlock({
    blockNumber: execEvent.blockNumber
  });

  return new Date(Number(timestamp) * 1000);
};
