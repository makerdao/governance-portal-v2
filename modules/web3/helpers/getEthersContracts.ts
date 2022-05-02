import { Web3Provider } from '@ethersproject/providers';
import { getRPCFromChainID } from './getRPC';
import { SupportedChainId } from '../constants/chainID';
import { Contract, ethers, providers } from 'ethers';
import { DEFAULT_NETWORK } from '../constants/networks';

export const getEthersContracts = <T extends Contract>(
  address: string, // deployed contract address
  abi: any,
  chainId?: SupportedChainId,
  library?: Web3Provider,
  account?: string
): T => {
  const rcpUrl = chainId ? getRPCFromChainID(chainId) : DEFAULT_NETWORK.defaultRpc;

  const readOnlyProvider = new providers.JsonRpcBatchProvider(rcpUrl);

  const signerOrProvider = account && library ? readOnlyProvider.getSigner(account) : readOnlyProvider;

  return new ethers.Contract(address, abi, signerOrProvider) as T;
};
