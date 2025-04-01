/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { chiefAbi, chiefAddress, mkrAbi, mkrAddress } from 'modules/contracts/generated';
import { getDelegateContractAddress } from 'modules/delegates/helpers/getDelegateContractAddress';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { getPublicClient } from 'modules/web3/helpers/getPublicClient';

export type MKRVotingWeightResponse = {
  walletBalanceHot: bigint;
  chiefBalanceHot: bigint;
  chiefTotal: bigint;
  total: bigint;
};

const getMKRBalanceOf = async (chainId: number, address: string): Promise<bigint> => {
  const publicClient = getPublicClient(chainId);
  const mkrBalance = await publicClient.readContract({
    address: mkrAddress[chainId],
    abi: mkrAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`]
  });
  return mkrBalance;
};

const getChiefDeposits = async (chainId: number, address: string): Promise<bigint> => {
  const publicClient = getPublicClient(chainId);
  const chiefDeposits = await publicClient.readContract({
    address: chiefAddress[chainId],
    abi: chiefAbi,
    functionName: 'deposits',
    args: [address as `0x${string}`]
  });
  return chiefDeposits;
};

// returns the voting weight for an address
export async function getMKRVotingWeight(
  address: string,
  network: SupportedNetworks,
  excludeDelegateOwnerBalance: boolean
): Promise<MKRVotingWeightResponse> {
  const chainId = networkNameToChainId(network);

  // first check if the address is a delegate contract and if so return the balance locked in the delegate contract
  const voteDelegateAddress = !excludeDelegateOwnerBalance
    ? await getDelegateContractAddress(address, chainId)
    : undefined;
  if (voteDelegateAddress) {
    const mkrDelegate = await getMKRBalanceOf(chainId, voteDelegateAddress);
    const mkrChiefDelegate = await getChiefDeposits(chainId, voteDelegateAddress);
    return {
      walletBalanceHot: mkrDelegate,
      chiefBalanceHot: mkrChiefDelegate,
      chiefTotal: mkrChiefDelegate,
      total: mkrDelegate + mkrChiefDelegate
    };
  }

  // otherwise, not delegate, get connected wallet balances
  const walletBalanceHot = await getMKRBalanceOf(chainId, address);
  const chiefBalanceHot = await getChiefDeposits(chainId, address);
  return {
    walletBalanceHot,
    chiefBalanceHot,
    chiefTotal: chiefBalanceHot,
    total: walletBalanceHot + chiefBalanceHot
  };
}
