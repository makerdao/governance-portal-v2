import { ethers, providers, Signer } from 'ethers';
import { getGoerliSdk, getMainnetSdk, GoerliSdk, MainnetSdk } from '@dethcrypto/eth-sdk-client';

import { Web3Provider } from '@ethersproject/providers';
import { CHAIN_INFO, DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { ZERO_ADDRESS } from 'modules/web3/constants/addresses';
import { SupportedChainId } from '../constants/chainID';
import { getRPCFromChainID } from './getRPC';
import { getDefaultProvider } from './getDefaultProvider';
import invariant from 'tiny-invariant';
import { isSupportedNetwork } from './networks';

export type EthSdk = MainnetSdk | GoerliSdk;

type SignerOrProvider = Signer | providers.Provider;

type Sdks = {
  mainnet: (signerOrProvider: SignerOrProvider) => MainnetSdk;
  goerli: (signerOrProvider: SignerOrProvider) => GoerliSdk;
};

const sdks: Sdks = {
  mainnet: getMainnetSdk,
  goerli: getGoerliSdk
};

export const replaceApiKey = (rpcUrl: string, newKey: string): string =>
  `${rpcUrl.substring(0, rpcUrl.lastIndexOf('/'))}/${newKey}`;

let connectedAccount: string | undefined;

const contractSingletons: { provider: null | EthSdk; signer: null | EthSdk } = {
  provider: null,
  signer: null
};

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

  invariant(isSupportedNetwork(networkInfo.network), `unsupported network ${networkInfo.network}`);

  // If a custom API key is provided, replace it in the URL
  if (apiKey) networkInfo.rpcUrl = replaceApiKey(networkInfo.rpcUrl, apiKey);

  const { network, rpcUrl } = networkInfo;

  const needsSigner = !readOnly && !!account && !!provider;

  const connectionType = needsSigner ? 'signer' : 'provider';

  const changeAccount = !!account && account !== connectedAccount;

  if (changeAccount || !contractSingletons[connectionType]) {
    const providerToUse = readOnly ? new providers.JsonRpcBatchProvider(rpcUrl) : getDefaultProvider(rpcUrl);

    // Map goerlifork to goerli contracts
    const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;

    const signerOrProvider = needsSigner ? provider.getSigner(account) : providerToUse;

    // Keep track of the connected account so we know if it needs to be changed later
    if (needsSigner && changeAccount) connectedAccount = account;
    contractSingletons[connectionType] = sdks[sdkNetwork](signerOrProvider);
  }

  // TODO need to account for sdkNetwork above
  // TODO need to fix connected acounts
  // TODO fix non-null assertion
  return contractSingletons[connectionType]!;
};
