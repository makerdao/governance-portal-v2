/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from '../helpers/chain';
import contractInfo from '../helpers/contract-info.json';
import { getPublicClient } from '../helpers/getPublicClient';
import { pauseAddress } from 'modules/contracts/generated';
const pauseInfo = contractInfo.pause;

export const getSpellExecutionDate = async (
  done: boolean,
  spellAddress: string,
  network?: SupportedNetworks
): Promise<Date | undefined> => {
  const chainId = networkNameToChainId(network || DEFAULT_NETWORK.network);
  const publicClient = getPublicClient(chainId);

  if (!done) return undefined;

  const string = spellAddress.replace(/^0x/, '');

  const paddedSpellAddress = '0x' + string.padStart(64, '0');

  const logs = await publicClient.getLogs({
    fromBlock: BigInt(pauseInfo.inception_block[network || DEFAULT_NETWORK.network]),
    toBlock: 'latest',
    address: pauseAddress[chainId]
  });

  const execEvent = logs.find(
    log =>
      log.topics[0] === pauseInfo.events.exec &&
      log.topics[1]?.toLowerCase() === paddedSpellAddress.toLowerCase()
  );

  if (!execEvent) return undefined;

  const { timestamp } = await publicClient.getBlock({
    blockNumber: execEvent.blockNumber
  });

  return new Date(Number(timestamp) * 1000);
};
