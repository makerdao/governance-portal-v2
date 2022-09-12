import { getRPCFromChainID } from './getRPC';
import { SupportedChainId } from '../constants/chainID';
import { Contract, ethers, providers } from 'ethers';
import { DEFAULT_NETWORK } from '../constants/networks';
import { getDefaultProvider } from './getDefaultProvider';

export const getEthersContracts = <T extends Contract>(
  address: string, // deployed contract address
  abi: any,
  chainId?: SupportedChainId,
  provider?: providers.Web3Provider,
  account?: string,
  readOnly?: boolean
): T => {
  const rcpUrl = getRPCFromChainID(chainId ?? DEFAULT_NETWORK.chainId);

  const providerToUse = readOnly ? new providers.JsonRpcBatchProvider(rcpUrl) : getDefaultProvider(rcpUrl);

  const signerOrProvider =
    account && provider
      ? readOnly
        ? (providerToUse as providers.JsonRpcBatchProvider).getSigner(account)
        : provider.getSigner(account)
      : providerToUse;

  return new ethers.Contract(address, abi, signerOrProvider) as T;
};
