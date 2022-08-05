import { providers, Signer } from 'ethers';
import { getGoerliSdk, getMainnetSdk, GoerliSdk, MainnetSdk } from '@dethcrypto/eth-sdk-client';

import { Web3Provider } from '@ethersproject/providers';
import { CHAIN_INFO, DEFAULT_NETWORK, SupportedNetworks } from '../constants/networks';
import { SupportedChainId } from '../constants/chainID';
import { getRPCFromChainID } from './getRPC';
import { getDefaultProvider } from './getDefaultProvider';
import invariant from 'tiny-invariant';
import { isSupportedNetwork } from './networks';
import { AccessType } from '../constants/wallets';

export type EthSdk = MainnetSdk | GoerliSdk;

type SignerOrProvider = Signer | providers.Provider;

type SdkGenerators = {
  mainnet: (signerOrProvider: SignerOrProvider) => MainnetSdk;
  goerli: (signerOrProvider: SignerOrProvider) => GoerliSdk;
};

const sdkGenerators: SdkGenerators = {
  mainnet: getMainnetSdk,
  goerli: getGoerliSdk
};

export const replaceApiKey = (rpcUrl: string, newKey: string): string =>
  `${rpcUrl.substring(0, rpcUrl.lastIndexOf('/'))}/${newKey}`;

let connectedAccount: string | undefined;
let currentNetwork: string | undefined;

const contracts: { readOnly: null | EthSdk; write: null | EthSdk } = {
  readOnly: null,
  write: null
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

  // TODO fix this
  // // If a custom API key is provided, replace it in the URL
  // if (apiKey) networkInfo.rpcUrl = replaceApiKey(networkInfo.rpcUrl, apiKey);

  const { network, rpcUrl } = networkInfo;

  // If the contract we need is not read only, and we have an account/provider then we need a signer
  const needsSigner = !readOnly && !!account && !!provider;

  // Keeping track of access type allows us to use specialized providers like JsonRpcBatchProvider
  const accessType: AccessType = needsSigner ? AccessType.WRITE : AccessType.READ_ONLY;

  // If our account or network changes, create a new provider
  const changeAccount = !!account && account !== connectedAccount;
  const changeNetwork = network !== currentNetwork;

  if (changeAccount || changeNetwork || !contracts[accessType]) {
    const providerToUse = readOnly ? new providers.JsonRpcBatchProvider(rpcUrl) : getDefaultProvider(rpcUrl);

    // Map goerlifork to goerli contracts
    const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;

    const signerOrProvider = needsSigner ? provider.getSigner(account) : providerToUse;

    // Keep track of the connected account and network so we know if it needs to be changed later
    if (needsSigner && changeAccount) connectedAccount = account;
    if (changeNetwork) currentNetwork = network;

    contracts[accessType] = sdkGenerators[sdkNetwork](signerOrProvider);
  }

  return contracts[accessType] as EthSdk;
};
