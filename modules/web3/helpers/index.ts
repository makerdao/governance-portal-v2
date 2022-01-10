import {
  CHAIN_INFO,
  DEFAULT_NETWORK,
  DEFAULT_NODE_PROVIDER,
  NETWORK_URLS,
  SupportedNetworks
} from '../web3.constants';

export { getLibrary } from './getLibrary';
export * from './errors';

export const networkToRpc = (
  network: string = DEFAULT_NETWORK,
  nodeProvider: string = DEFAULT_NODE_PROVIDER
): string => NETWORK_URLS[network][nodeProvider];

export const chainIdToNetworkName = (chainId: number): SupportedNetworks => {
  for (const chain in CHAIN_INFO) {
    if (CHAIN_INFO[chain].chainId === chainId) {
      return chain as SupportedNetworks;
    }
  }
  throw new Error(`Unsupported chain id ${chainId}`);
};
