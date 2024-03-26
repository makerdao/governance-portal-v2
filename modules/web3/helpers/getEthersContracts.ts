/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { getRPCFromChainID } from './getRPC';
import { chainIdToNetworkName } from './chain';
import { SupportedChainId } from '../constants/chainID';
import { Contract, ethers, providers } from 'ethers';
import { DEFAULT_NETWORK } from '../constants/networks';
import { getDefaultProvider } from './getDefaultProvider';

export const getEthersContracts = <T extends Contract>(
  address: string, // deployed contract address
  abi: any,
  chainId?: SupportedChainId,
  provider?: providers.Web3Provider,
  account?: string,
  readOnly?: boolean
): T => {
  const rcpUrl = getRPCFromChainID(chainId ?? DEFAULT_NETWORK.chainId);
  const network = chainIdToNetworkName(chainId ?? DEFAULT_NETWORK.chainId);

  const providerToUse = readOnly ? new providers.JsonRpcBatchProvider(rcpUrl) : getDefaultProvider(network);

  const signerOrProvider =
    account && provider
      ? readOnly
        ? (providerToUse as providers.JsonRpcBatchProvider).getSigner(account)
        : provider.getSigner(account)
      : providerToUse;

  return new ethers.Contract(address, abi, signerOrProvider) as T;
};
