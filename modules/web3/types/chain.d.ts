import { GaslessChainId, SupportedChainId } from '../constants/chainID';
import { GaslessNetworks, SupportedNetworks } from '../constants/networks';

export type Chain = {
  etherscanPrefix: string;
  chainId: SupportedChainId | GaslessChainId;
  label: string;
  network: SupportedNetworks | GaslessNetworks;
  defaultRpc: string;
  spockUrl: string;
  rpcs: {
    [key: string]: string;
  };
};
