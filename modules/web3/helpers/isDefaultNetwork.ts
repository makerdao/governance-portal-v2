import { SupportedChainId } from 'modules/web3/constants/chainID';
import { CHAIN_INFO } from 'modules/web3/constants/networks';

export const isDefaultNetwork = (chainId?: number): boolean => {
  const defaultNetwork = CHAIN_INFO[SupportedChainId.MAINNET];

  return chainId === defaultNetwork.chainId;
};
