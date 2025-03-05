/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { networkNameToChainId } from '../helpers/chain';
import { getPublicClient } from '../helpers/getPublicClient';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';

export const getChiefApprovals = async (address: string, network?: SupportedNetworks): Promise<bigint> => {
  const chainId = networkNameToChainId(network || DEFAULT_NETWORK.network);
  const publicClient = getPublicClient(chainId);

  return await publicClient.readContract({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    functionName: 'approvals',
    args: [address as `0x${string}`]
  });
};
