import { Contract, ethers } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getArbitrumRelaySigner } from './getArbitrumRelaySigner';
import { arbitrumSdkGenerators } from '../helpers/relayerCredentials';
import { getGaslessProvider } from 'modules/web3/helpers/chain';

//Note that we'll get an error if we try to run this defender relay code on the frontend
//So we should only import this function on the backend
export const getArbitrumPollingContractRelayProvider = async (
  network: SupportedNetworks
): Promise<Contract> => {
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;

  let signer;
  if (network === SupportedNetworks.GOERLIFORK) {
    const provider = getGaslessProvider(network);
    // Since we can't yet run a relayer locally, we can just send the transaction from an account controlled by hardhat
    const [testSigner] = await provider.send('eth_accounts', []);
    signer = provider.getSigner(testSigner);
  } else {
    signer = getArbitrumRelaySigner(sdkNetwork);
  }

  const { polling } = arbitrumSdkGenerators[sdkNetwork](signer);

  return polling;
};
