import { Contract } from 'ethers';
import { getArbitrumGoerliTestnetSdk, getArbitrumOneSdk } from '@dethcrypto/eth-sdk-client';
import { ArbitrumSdkGenerators } from 'modules/web3/types/contracts';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getGaslessProvider } from 'modules/web3/helpers/chain';

export const arbitrumSdkGenerators: ArbitrumSdkGenerators = {
  mainnet: getArbitrumOneSdk,
  goerli: getArbitrumGoerliTestnetSdk
};

export const getArbitrumPollingContractReadOnly = (network: SupportedNetworks): Contract => {
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;
  const gaslessProvider = getGaslessProvider(network);
  const { polling } = arbitrumSdkGenerators[sdkNetwork](gaslessProvider);
  return polling;
};
