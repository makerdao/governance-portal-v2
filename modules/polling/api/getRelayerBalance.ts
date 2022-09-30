import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatEther } from 'ethers/lib/utils';
import { getArbitrumRelaySigner } from './getArbitrumRelaySigner';
import logger from 'lib/logger';

export const getRelayerBalance = async (network: SupportedNetworks): Promise<string> => {
  try {
    const sdkNetwork = network === SupportedNetworks.GOERLIFORK ? SupportedNetworks.GOERLI : network;

    const signer = getArbitrumRelaySigner(sdkNetwork);
    const address = await signer.getAddress();
    const balance = await signer.provider.getBalance(address);

    return formatEther(balance);
  } catch (err) {
    logger.error(err);
    return '0';
  }
};
