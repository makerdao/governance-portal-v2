import { Contract, getDefaultProvider } from 'ethers';
import { CHAIN_INFO } from '../web3.constants';
import { Web3Provider } from '@ethersproject/providers';
import { getNetwork } from 'lib/maker';

export const getEthersContracts = (
  address: string, // deployed contract address
  abi: any,
  chainId?: number,
  library?: Web3Provider,
  account?: string | undefined | null
): Contract => {
  const network = chainId ? CHAIN_INFO[chainId].network : getNetwork();
  const readOnlyProvider = getDefaultProvider(network);

  const signerOrProvider = account && library ? library.getSigner(account) : readOnlyProvider;

  return new Contract(address, abi, signerOrProvider);
};
