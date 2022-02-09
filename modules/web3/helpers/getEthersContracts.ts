import { Web3Provider } from '@ethersproject/providers';
import { getRPCFromChainID } from './getRPC';
import { SupportedChainId } from '../constants/chainID';
import { Contract, ethers } from 'ethers';
import { getDefaultProvider } from './getDefaultProvider';

export const getEthersContracts = <T extends Contract>(
  address: string, // deployed contract address
  abi: any,
  chainId?: SupportedChainId,
  library?: Web3Provider,
  account?: string
): T => {
  const readOnlyProvider = getDefaultProvider(getRPCFromChainID(chainId || 1));

  const signerOrProvider = account && library ? library.getSigner(account) : readOnlyProvider;

  return new ethers.Contract(address, abi, signerOrProvider) as T;
};
