import { Contract } from 'ethers';
import { getArbitrumGoerliTestnetSdk, getArbitrumOneSdk } from '@dethcrypto/eth-sdk-client';
import { config } from 'lib/config';
import { SdkGenerators } from '/types/contracts';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getGaslessProvider } from 'modules/web3/helpers/chain';

export const relayerCredentials = {
  mainnet: { apiKey: config.DEFENDER_API_KEY_PROD, apiSecret: config.DEFENDER_API_SECRET_PROD },
  goerli: { apiKey: config.DEFENDER_API_KEY, apiSecret: config.DEFENDER_API_SECRET }
};

export const arbitrumSdkGenerators: SdkGenerators = {
  mainnet: getArbitrumOneSdk,
  goerli: getArbitrumGoerliTestnetSdk
};

export const getArbitrumPollingContractReadOnly = (network: SupportedNetworks): Contract => {
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;
  const gaslessProvider = getGaslessProvider(network);
  const { polling } = arbitrumSdkGenerators[sdkNetwork](gaslessProvider);
  return polling;
};
