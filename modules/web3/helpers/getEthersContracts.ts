import { Web3Provider } from '@ethersproject/providers';
import { getRPCFromChainID } from './getRPC';
import { SupportedChainId } from '../constants/chainID';
import { ethers } from 'ethers';

export const getEthersContracts = (
  address: string, // deployed contract address
  abi: any,
  chainId?: SupportedChainId,
  library?: Web3Provider,
  account?: string
): ethers.Contract => {
  const readOnlyProvider = ethers.getDefaultProvider(getRPCFromChainID(chainId || 1));

  const signerOrProvider = account && library ? library.getSigner(account) : readOnlyProvider;

  return new ethers.Contract(address, abi, signerOrProvider);
};
