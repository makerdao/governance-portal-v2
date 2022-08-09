import { providers, Signer } from 'ethers';
import { getGoerliSdk, getMainnetSdk, GoerliSdk, MainnetSdk } from '@dethcrypto/eth-sdk-client';

import { SupportedNetworks } from '../constants/networks';

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

let currentNetwork: string | undefined;

const readOnlyContracts: Record<string, EthSdk | null> = {
  default: null
};

export const getReadOnlyContracts = (
  rpcUrl: string,
  network: SupportedNetworks.MAINNET | SupportedNetworks.GOERLI,
  apiKey?: string
): EthSdk => {
  let contractsKey = 'default';

  if (apiKey) {
    contractsKey = apiKey;

    // If a custom API key is provided, replace it in the URL
    rpcUrl = replaceApiKey(rpcUrl, apiKey);
  }

  const changeNetwork = network !== currentNetwork;

  if (!readOnlyContracts[contractsKey] || changeNetwork) {
    const batchProvider = new providers.JsonRpcBatchProvider(rpcUrl);

    if (changeNetwork) currentNetwork = network;
    readOnlyContracts[contractsKey] = sdkGenerators[network](batchProvider);
  }
  return readOnlyContracts[contractsKey] as EthSdk;
};
