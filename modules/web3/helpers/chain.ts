import { ethers } from 'ethers';
import { SupportedChainId } from '../constants/chainID';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';
import { BlockExplorer } from '../types/chain';
import { getRPCFromChainID } from './getRPC';

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
  return CHAIN_INFO[chainId] && CHAIN_INFO[chainId].type === 'normal';
};

export const getGaslessNetwork = (network: SupportedNetworks): SupportedNetworks => {
  if (network === SupportedNetworks.MAINNET) {
    return SupportedNetworks.ARBITRUM;
  } else {
    return SupportedNetworks.ARBITRUMTESTNET;
  }
};

export const getProvider = (network: SupportedNetworks): ethers.providers.JsonRpcProvider => {
  const chainId = networkNameToChainId(network);
  const url = getRPCFromChainID(chainId);
  return new ethers.providers.JsonRpcProvider(url);
};

export const getGaslessProvider = (network: SupportedNetworks): ethers.providers.JsonRpcProvider => {
  // TODO: add arb-testnet fork to enums and return RPC that way
  if (network === SupportedNetworks.GOERLIFORK) {
    return new ethers.providers.JsonRpcProvider('http://127.0.0.1:8546');
  }

  const gaslessNetwork = getGaslessNetwork(network);

  const chainId = networkNameToChainId(gaslessNetwork);
  const url = getRPCFromChainID(chainId);
  return new ethers.providers.JsonRpcProvider(url);
};

export const getBlockExplorerName = (network: SupportedNetworks): BlockExplorer => {
  const chainId = networkNameToChainId(network);
  if (!CHAIN_INFO) return 'block explorer';
  return CHAIN_INFO[chainId]?.blockExplorerName || 'block explorer';
};
