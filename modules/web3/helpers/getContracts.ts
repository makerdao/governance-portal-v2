import { ethers, providers, Signer } from 'ethers';
import { getGoerliSdk, getMainnetSdk, GoerliSdk, MainnetSdk } from '@dethcrypto/eth-sdk-client';

import { Web3Provider } from '@ethersproject/providers';
import { CHAIN_INFO, DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { SupportedChainId } from '../constants/chainID';
import { getRPCFromChainID } from './getRPC';
import { getDefaultProvider } from './getDefaultProvider';

export type EthSdk = MainnetSdk | GoerliSdk;

type Sdks = {
  mainnet: (signer: Signer) => MainnetSdk;
  goerli: (signer: Signer) => GoerliSdk;
};

const sdks: Sdks = {
  mainnet: getMainnetSdk,
  goerli: getGoerliSdk
};

export const replaceApiKey = (rpcUrl: string, newKey: string): string =>
  `${rpcUrl.substring(0, rpcUrl.lastIndexOf('/'))}/${newKey}`;

// this name doesn't feel right, maybe getSdk? or getContractLibrary?
export const getContracts = (
  chainId?: SupportedChainId,
  provider?: Web3Provider,
  account?: string | null,
  readOnly?: boolean,
  apiKey?: string
): EthSdk => {
  const networkInfo = chainId
    ? { network: CHAIN_INFO[chainId].network, rpcUrl: getRPCFromChainID(chainId) }
    : { network: DEFAULT_NETWORK.network, rpcUrl: DEFAULT_NETWORK.defaultRpc };

  // If a custom API key is provided, replace it in the URL
  if (apiKey) networkInfo.rpcUrl = replaceApiKey(networkInfo.rpcUrl, apiKey);

  const { network, rpcUrl } = networkInfo;

  const providerToUse = readOnly ? new providers.JsonRpcBatchProvider(rpcUrl) : getDefaultProvider(rpcUrl);

  // Map goerlifork to goerli contracts
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;
  /* 
  A read-only signer, when an API requires a Signer as a parameter, but it is known only read-only operations will be carried.
  https://docs.ethers.io/v5/api/signer/#VoidSigner 

  eth-sdk only accepts a signer for now, but there's an issue for it
  https://github.com/dethcrypto/eth-sdk/issues/63
  */
  const signer =
    account && provider
      ? readOnly
        ? (providerToUse as providers.JsonRpcBatchProvider).getSigner(account)
        : provider.getSigner(account)
      : new ethers.VoidSigner(ZERO_ADDRESS, providerToUse);

  return sdks[sdkNetwork](signer);
};
