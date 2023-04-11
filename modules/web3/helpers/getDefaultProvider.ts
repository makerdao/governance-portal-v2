/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from '../constants/networks';
import { config } from 'lib/config';
import { ethers, providers } from 'ethers';

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

export const getDefaultProvider = (
  network: SupportedNetworks | string | undefined,
  optionsOverrides?: Record<string, string>
): providers.BaseProvider => {
  const options = {
    infura: config.INFURA_KEY,
    alchemy: config.ALCHEMY_KEY,
    pocket: config.POCKET_KEY,
    etherscan: config.ETHERSCAN_KEY,
    ...(optionsOverrides || {})
  };

  return ethers.getDefaultProvider(network, options);
};
