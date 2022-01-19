import { SupportedChainId } from '../constants/chainID';

export type Chain = {
  etherscanPrefix: string;
  chainId: SupportedChainId;
  label: string;
  network: string;
  defaultRPC: string;
  spockURL: string;
  rpcs: {
    [key: string]: string;
  };
};
