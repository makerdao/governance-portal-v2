import { getGoerliSdk, getMainnetSdk } from '@dethcrypto/eth-sdk-client';

import { Web3Provider } from '@ethersproject/providers';
import { CHAIN_INFO, DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { SupportedChainId } from '../constants/chainID';
import { getRPCFromChainID } from './getRPC';
import { getDefaultProvider } from './getDefaultProvider';
import { getReadOnlyContracts } from './getReadOnlyContracts';
import { EthSdk, SdkGenerators } from '../types/contracts';

const sdkGenerators: SdkGenerators = {
  mainnet: getMainnetSdk,
  goerli: getGoerliSdk
};

export const replaceApiKey = (rpcUrl: string, newKey: string): string =>
  `${rpcUrl.substring(0, rpcUrl.lastIndexOf('/'))}/${newKey}`;

let connectedAccount: string | undefined;
let currentNetwork: string | undefined;

const contracts: Record<string, EthSdk | null> = {
  default: null
};

export const getContracts = (
  chainId?: SupportedChainId,
  provider?: Web3Provider,
  account?: string | null,
  readOnly?: boolean,
  apiKey?: string
): EthSdk => {
  const network = chainId ? CHAIN_INFO[chainId].network : DEFAULT_NETWORK.network;
  let rpcUrl = chainId ? getRPCFromChainID(chainId) : DEFAULT_NETWORK.defaultRpc;

  // Map goerlifork to goerli contracts
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;

  if (readOnly) {
    return getReadOnlyContracts(rpcUrl, sdkNetwork);
  }

  // Use the default API key, unless a custom API key is provided
  let contractsKey = 'default';

  if (apiKey) {
    contractsKey = apiKey;
    // If a custom API key is provided, replace it in the URL
    rpcUrl = replaceApiKey(rpcUrl, apiKey);
  }

  // If we have an account and provider then we'll use a signer
  const needsSigner = !!account && !!provider;

  const changeAccount = !!account && account !== connectedAccount;
  const changeNetwork = network !== currentNetwork;

  // If our account or network changes, recreate the contracts SDK
  if (changeAccount || changeNetwork || !contracts[contractsKey]) {
    const providerToUse = provider ?? getDefaultProvider(rpcUrl);

    const signerOrProvider = needsSigner ? providerToUse.getSigner(account) : providerToUse;

    // Keep track of the connected account and network so we know if it needs to be changed later
    if (needsSigner && changeAccount) connectedAccount = account;
    if (changeNetwork) currentNetwork = network;

    contracts[contractsKey] = sdkGenerators[sdkNetwork](signerOrProvider);
  }

  return contracts[contractsKey] as EthSdk;
};
