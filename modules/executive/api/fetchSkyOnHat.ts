/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getChiefApprovals } from 'modules/web3/api/getChiefApprovals';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';
import { chiefAbi, chiefAddress } from 'modules/contracts/generated';

export type SkyOnHatResponse = {
  hat: string;
  skyOnHat: bigint;
};

export async function fetchSkyOnHat(network?: SupportedNetworks): Promise<SkyOnHatResponse> {
  const chainId = network ? networkNameToChainId(network) : networkNameToChainId(SupportedNetworks.MAINNET);
  const publicClient = getPublicClient(chainId);

  const hat = await publicClient.readContract({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    functionName: 'hat'
  });

  const skyOnHat = await getChiefApprovals(hat, network);

  return { hat, skyOnHat };
}
