import { SupportedChainId, GaslessChainId } from '../constants/chainID';
import { CHAIN_INFO, GASLESS_CHAIN_INFO, SupportedNetworks, GaslessNetworks } from '../constants/networks';

export const chainIdToNetworkName = (chainId?: number): SupportedNetworks | GaslessNetworks => {
  if (!chainId) return SupportedNetworks.MAINNET;
  if (CHAIN_INFO[chainId]) return CHAIN_INFO[chainId].network;
  if (GASLESS_CHAIN_INFO[chainId]) return GASLESS_CHAIN_INFO[chainId].network;
  throw new Error(`Unsupported chain id ${chainId}`);
};

export const networkNameToChainId = (networkName: string): number => {
  const [key] = [...Object.entries(SupportedNetworks), ...Object.entries(GaslessNetworks)].find(([, v]) => v === networkName) || [];
  if (key && SupportedChainId[key]) return parseInt(SupportedChainId[key]);
  if (key && GaslessChainId[key]) return parseInt(GaslessChainId[key]);
  throw new Error(`Unsupported network name ${networkName}`);
};
