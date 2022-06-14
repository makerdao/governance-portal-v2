import { Web3Provider } from '@ethersproject/providers';
import { getRPCFromChainID } from './getRPC';
import { SupportedChainId } from '../constants/chainID';
import { Contract, ethers, providers } from 'ethers';
import { DEFAULT_NETWORK } from '../constants/networks';
import { getDefaultProvider } from './getDefaultProvider';

export const getEthersContracts = <T extends Contract>(
  address: string, // deployed contract address
  abi: any,
  chainId?: SupportedChainId,
  library?: Web3Provider,
  account?: string,
  readOnly?: boolean
): T => {
  const rcpUrl = getRPCFromChainID(chainId ?? DEFAULT_NETWORK.chainId);

  const provider = readOnly ? new providers.JsonRpcBatchProvider(rcpUrl) : getDefaultProvider(rcpUrl);

  const signerOrProvider =
    account && library
      ? readOnly
        ? (provider as providers.JsonRpcBatchProvider).getSigner(account)
        : library.getSigner(account)
      : provider;

  return new ethers.Contract(address, abi, signerOrProvider) as T;
};
