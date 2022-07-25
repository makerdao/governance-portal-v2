import { GaslessChainId, SupportedChainId } from '../constants/chainID';
import { GaslessNetworks, SupportedNetworks } from '../constants/networks';

export type BlockExplorer = 'Etherscan' | 'Arbiscan' | 'block explorer';

export type SupportedChain = {
  blockExplorerUrl: string;
  blockExplorerName: BlockExplorer;
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
  blockExplorerName: BlockExplorer;
  chainId: GaslessChainId;
  label: string;
  network: GaslessNetworks;
  defaultRpc: string;
  rpcs: {
    [key: string]: string;
  };
};
