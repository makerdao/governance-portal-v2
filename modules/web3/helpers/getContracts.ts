/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { getGoerliSdk, getMainnetSdk } from '@dethcrypto/eth-sdk-client';

import { providers } from 'ethers';
import { CHAIN_INFO, DEFAULT_NETWORK } from '../constants/networks';
import { SupportedChainId } from '../constants/chainID';
import { getRPCFromChainID } from './getRPC';
import { getDefaultProvider } from './getDefaultProvider';
import { getReadOnlyContracts } from './getReadOnlyContracts';
import { EthSdk, SdkGenerators } from '../types/contracts';

const sdkGenerators: SdkGenerators = {
  mainnet: getMainnetSdk,
  goerli: getGoerliSdk,
  goerlifork: getGoerliSdk
};

let connectedAccount: string | undefined;
let currentNetwork: string | undefined;

let contracts: EthSdk | null = null;

// Check the SDK contracts for a signer, this assumes there is at least one contract
// and all contracts in the SDK use the signer.
const hasSigner = (contracts: EthSdk | null) => {
  return contracts && !!contracts[Object.keys(contracts)[0]]?.signer;
};

export const getContracts = (
  chainId?: SupportedChainId,
  provider?: providers.Web3Provider,
  account?: string | null,
  readOnly?: boolean
): EthSdk => {
  const network = chainId ? CHAIN_INFO[chainId].network : DEFAULT_NETWORK.network;
  const rpcUrl = chainId ? getRPCFromChainID(chainId) : DEFAULT_NETWORK.defaultRpc;

  if (readOnly) {
    return getReadOnlyContracts(rpcUrl, network);
  }

  // If we have an account and provider then we'll use a signer
  const needsSigner = !!account && !!provider;

  const changeAccount = !!account && account !== connectedAccount;
  const changeNetwork = network !== currentNetwork;

  // If our account or network changes, recreate the contracts SDK
  if (changeAccount || changeNetwork || !contracts || (needsSigner && !hasSigner(contracts))) {
    const providerToUse = provider ?? getDefaultProvider(rpcUrl);

    const signerOrProvider = needsSigner
      ? (providerToUse as providers.Web3Provider).getSigner(account)
      : providerToUse;

    // Keep track of the connected account and network so we know if it needs to be changed later
    if (needsSigner && changeAccount) connectedAccount = account;
    if (changeNetwork) currentNetwork = network;

    contracts = sdkGenerators[network](signerOrProvider);
  }

  return contracts as EthSdk;
};
