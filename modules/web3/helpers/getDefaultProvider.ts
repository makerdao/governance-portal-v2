import { BaseProvider } from '@ethersproject/providers';
import { SupportedNetworks } from '../constants/networks';
import { config } from 'lib/config';
import { ethers } from 'ethers';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

export const getDefaultProvider = (
  network: SupportedNetworks | string | undefined,
  optionsOverrides?: Record<string, string>
): BaseProvider => {
  const options = {
    infura: config.INFURA_KEY,
    alchemy: config.ALCHEMY_KEY,
    pocket: config.POCKET_KEY,
    etherscan: config.ETHERSCAN_KEY,
    ...(optionsOverrides || {})
  };

  return ethers.getDefaultProvider(network, options);
};
