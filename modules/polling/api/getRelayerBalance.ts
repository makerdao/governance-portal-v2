import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatEther } from 'ethers/lib/utils';
import { getArbitrumRelaySigner } from './getArbitrumRelaySigner';

export const getRelayerBalance = async (network: SupportedNetworks): Promise<string> => {
  const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;

  const signer = getArbitrumRelaySigner(sdkNetwork);
  const address = await signer.getAddress();
  const balance = await signer.provider.getBalance(address);

  return formatEther(balance);
};
