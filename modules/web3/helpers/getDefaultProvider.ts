/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from '../constants/networks';
import { config } from 'lib/config';
import { ethers, providers } from 'ethers';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

export const getDefaultProvider = (
  network: SupportedNetworks | string | undefined
): providers.FallbackProvider => {
    const infuraProvider = new ethers.providers.InfuraProvider(network, config.INFURA_KEY);
    const alchemyProvider = new ethers.providers.AlchemyProvider(network, config.ALCHEMY_KEY);
    const pocketProvider = new ethers.providers.PocketProvider(network, config.POCKET_KEY);
    const etherscanProvider = new ethers.providers.EtherscanProvider(network, config.ETHERSCAN_KEY);
  
    const provider = new ethers.providers.FallbackProvider([
      { provider: infuraProvider, priority: 2 },
      { provider: alchemyProvider, priority: 1 },
      { provider: pocketProvider, priority: 3 },
      { provider: etherscanProvider, priority: 3 }
    ], 1); //Quorum of 1
  
    return provider;
  };
