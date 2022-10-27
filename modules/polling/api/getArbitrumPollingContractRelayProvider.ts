import { Contract, ethers } from 'ethers';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { getArbitrumRelaySigner } from './getArbitrumRelaySigner';
import { arbitrumSdkGenerators } from '../helpers/relayerCredentials';

//Note that we'll get an error if we try to run this defender relay code on the frontend
//So we should only import this function on the backend
export const getArbitrumPollingContractRelayProvider = async (
  network: SupportedNetworks
): Promise<Contract> => {
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;

  // TODO move this to .env or try to detect from cypress
  const isTest = true;
  let signer;
  if (isTest) {
    // Since we can't yet run a relayer locally, we can just send the transaction from an account controlled by use on our fork
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8546/');
    const [testSigner] = await provider.send('eth_accounts', []);
    signer = await provider.getSigner(testSigner);
  } else {
    signer = getArbitrumRelaySigner(sdkNetwork);
  }

  const { polling } = arbitrumSdkGenerators[sdkNetwork](signer);

  return polling;
};
