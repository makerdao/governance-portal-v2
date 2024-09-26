/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from '../constants/networks';
import { config } from 'lib/config';
import { ethers, providers } from 'ethers';
import tenderlyTestnetData from '../../../tenderlyTestnetData.json';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

const { TENDERLY_RPC_URL } = tenderlyTestnetData;

export const getDefaultProvider = (
  network: SupportedNetworks | string | undefined
): providers.FallbackProvider => {
  if (network === SupportedNetworks.TENDERLY) {
    return new ethers.providers.FallbackProvider(
      [
        new ethers.providers.JsonRpcProvider(
          TENDERLY_RPC_URL || `https://virtual.mainnet.rpc.tenderly.co/${config.TENDERLY_RPC_KEY}`
        )
      ],
      1
    );
  } else {
    const infuraProvider = new ethers.providers.InfuraProvider(network, config.INFURA_KEY);
    const alchemyProvider = new ethers.providers.AlchemyProvider(network, config.ALCHEMY_KEY);
    const pocketProvider = new ethers.providers.PocketProvider(network, config.POCKET_KEY);
    const etherscanProvider = new ethers.providers.EtherscanProvider(network, config.ETHERSCAN_KEY);

    const provider = new ethers.providers.FallbackProvider(
      [
        { provider: infuraProvider, priority: 2 },
        { provider: alchemyProvider, priority: 1 },
        { provider: pocketProvider, priority: 3 },
        { provider: etherscanProvider, priority: 3 }
      ],
      1
    ); //Quorum of 1

    return provider;
  }
};
