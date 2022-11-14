import { SupportedNetworks } from 'modules/web3/constants/networks';
import { DefenderRelayProvider, DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { relayerCredentials } from '../helpers/relayerCredentials';

//Note that we'll get an error if we try to run this defender relay code on the frontend
//So we should only import this function on the backend
export const getArbitrumRelaySigner = (network: SupportedNetworks): DefenderRelaySigner => {
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;
  const provider = new DefenderRelayProvider(relayerCredentials[sdkNetwork]);
  const signer = new DefenderRelaySigner(relayerCredentials[sdkNetwork], provider, {
    speed: 'fastest' // 'safeLow' | 'average' | 'fast' | 'fastest'
  });

  return signer;
};
