import { Contract } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { arbitrumSdkGenerators, getArbitrumRelaySigner } from './getArbitrumRelaySigner';

//Note that we'll get an error if we try to run this defender relay code on the frontend
//So we should only import this function on the backend
export const getArbitrumPollingContractRelayProvider = (network: SupportedNetworks): Contract => {
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;
  const signer = getArbitrumRelaySigner(sdkNetwork);

  const { polling } = arbitrumSdkGenerators[sdkNetwork](signer);

  return polling;
};
