import { SupportedChainId } from '../constants/chainID';
import { CHAIN_INFO, SupportedNetworks } from '../constants/networks';

export const isDefaultNetwork = (chainId?: number): boolean => {
  const defaultNetwork = CHAIN_INFO[SupportedChainId.MAINNET];

  return chainId === defaultNetwork.chainId;
};

export function isSupportedNetwork(_network: string): _network is SupportedNetworks {
  return Object.values(SupportedNetworks).some(network => network.toLowerCase() === _network);
}
