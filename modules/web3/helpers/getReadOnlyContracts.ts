import { providers } from 'ethers';
import { getGoerliSdk, getMainnetSdk } from '@dethcrypto/eth-sdk-client';

import { SupportedNetworks } from '../constants/networks';
import { EthSdk, SdkGenerators } from '../types/contracts';

const sdkGenerators: SdkGenerators = {
  mainnet: getMainnetSdk,
  goerli: getGoerliSdk,
  goerlifork: getGoerliSdk
};

let currentNetwork: string | undefined;

let readOnlyContracts: EthSdk | null = null;

export const getReadOnlyContracts = (
  rpcUrl: string,
  network: SupportedNetworks.MAINNET | SupportedNetworks.GOERLI | SupportedNetworks.GOERLIFORK
): EthSdk => {
  const changeNetwork = network !== currentNetwork;

  if (!readOnlyContracts || changeNetwork) {
    const batchProvider = new providers.JsonRpcBatchProvider(rpcUrl);

    if (changeNetwork) currentNetwork = network;
    readOnlyContracts = sdkGenerators[network](batchProvider);
  }

  return readOnlyContracts as EthSdk;
};
