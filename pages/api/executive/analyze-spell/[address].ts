/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { analyzeSpell } from 'modules/executive/api/analyzeSpell';
import { validateAddress } from 'modules/web3/api/validateAddress';
// In memory result cache
const results = {};

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // validate network
  const network = validateQueryParam(
    (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network,
    'string',
    {
      defaultValue: null,
      validValues: [SupportedNetworks.GOERLI, SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
    },
    n => !!n,
    new ApiError('Invalid network', 400, 'Invalid network')
  ) as SupportedNetworks;

  // validate address
  const address = await validateAddress(
    req.query.address as string,
    new ApiError('Invalid address', 400, 'Invalid address')
  );

  let analysis;

  if (!results[network]) {
    results[network] = {};
  }

  if (results[network][address]) {
    analysis = results[network][address];
  } else {
    analysis = await analyzeSpell(address, network);
    if (analysis.hasBeenCast) {
      results[network][address] = analysis;
    }
  }

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(analysis);
});
