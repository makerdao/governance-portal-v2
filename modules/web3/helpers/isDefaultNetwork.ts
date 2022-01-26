import { DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';

export const isDefaultNetwork = (network?: SupportedNetworks): boolean => {
  return network === DEFAULT_NETWORK.network;
};

export function isSupportedNetwork(_network: string): _network is SupportedNetworks {
  return Object.values(SupportedNetworks).some(network => network.toLowerCase() === _network);
}
