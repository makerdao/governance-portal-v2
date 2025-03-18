/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedChainId } from '../constants/chainID';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';
import { BlockExplorer } from '../types/chain';

export const chainIdToNetworkName = (chainId?: number): SupportedNetworks => {
  if (!chainId) return SupportedNetworks.MAINNET;
  if (CHAIN_INFO[chainId]) return CHAIN_INFO[chainId].network;
  throw new Error(`Unsupported chain id ${chainId}`);
};

export const networkNameToChainId = (networkName: string): number => {
  const [key] = Object.entries(SupportedNetworks).find(([, v]) => v === networkName) || [];
  if (key && SupportedChainId[key]) return parseInt(SupportedChainId[key]);
  throw new Error(`Unsupported network name ${networkName}`);
};

export const isSupportedChain = (chainId?: number): boolean => {
  if (!chainId) return false;
  const isProduction =
    process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development';
  return (
    CHAIN_INFO[chainId] &&
    CHAIN_INFO[chainId].type === 'normal' &&
    (!isProduction || CHAIN_INFO[chainId].showInProduction)
  );
};

export const getGaslessNetwork = (network: SupportedNetworks): SupportedNetworks => {
  if (network === SupportedNetworks.MAINNET) {
    return SupportedNetworks.ARBITRUM;
  } else {
    return SupportedNetworks.ARBITRUMTESTNET;
  }
};

export const getBlockExplorerName = (network: SupportedNetworks): BlockExplorer => {
  const chainId = networkNameToChainId(network);
  if (!CHAIN_INFO) return 'block explorer';
  return CHAIN_INFO[chainId]?.blockExplorerName || 'block explorer';
};
