/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { chiefAbi, chiefAddress } from 'modules/contracts/generated';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';

export type MKRVotingWeightResponse = bigint;

// returns the voting weight for an address
export async function getMKRVotingWeight(
  address: string,
  network: SupportedNetworks,
  excludeDelegateOwnerBalance: boolean
): Promise<MKRVotingWeightResponse> {
  const chainId = networkNameToChainId(network);
  const publicClient = getPublicClient(chainId);

  // first check if the address is a delegate contract and if so return the balance locked in the delegate contract
  const voteDelegateAddress = !excludeDelegateOwnerBalance
    ? await getDelegateContractAddress(address, chainId)
    : undefined;
  if (voteDelegateAddress) {
    return publicClient.readContract({
      address: chiefAddress[chainId],
      abi: chiefAbi,
      functionName: 'deposits',
      args: [voteDelegateAddress as `0x${string}`]
    });
  }

  // otherwise, not delegate, get connected wallet chief balance
  return publicClient.readContract({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    functionName: 'deposits',
    args: [address as `0x${string}`]
  });
}
