import { SupportedChainId } from '../constants/chainID';

export type Chain = {
  etherscanPrefix: string;
  chainId: SupportedChainId;
  label: string;
  network: string;
  defaultRpc: string;
  spockUrl: string;
  rpcs: {
    [key: string]: string;
  };
};
