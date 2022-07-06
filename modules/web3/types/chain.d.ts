import { GaslessChainId, SupportedChainId } from '../constants/chainID';
import { GaslessNetworks, SupportedNetworks } from '../constants/networks';

export type Chain = {
  blockExplorerUrl: string;
  chainId: SupportedChainId;
  label: string;
  network: SupportedNetworks;
  defaultRpc: string;
  spockUrl: string;
  rpcs: {
    [key: string]: string;
  };
};

export type GaslessChain = {
  blockExplorerUrl: string;
  chainId: GaslessChainId;
  label: string;
  network:GaslessNetworks;
};
