import {
  CHAIN_INFO,
  DEFAULT_NETWORK,
  DEFAULT_NODE_PROVIDER,
  NETWORK_URLS,
  SupportedNetworks
} from 'modules/web3/web3.constants';

export { getLibrary } from './getLibrary';
export * from './errors';

export const networkToRpc = (
  network: string = DEFAULT_NETWORK,
  nodeProvider: string = DEFAULT_NODE_PROVIDER
): string => {
  return NETWORK_URLS[network][nodeProvider];
};

export const chainIdToNetworkName = (chainId: number): SupportedNetworks => {
  if (CHAIN_INFO[chainId]) return CHAIN_INFO[chainId].network;
  throw new Error(`Unsupported chain id ${chainId}`);
};
