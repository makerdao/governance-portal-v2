import { SupportedChainId } from '../constants/chainID';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';

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
