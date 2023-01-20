/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { fetchDelegationEventsByAddresses } from 'modules/delegates/api/fetchDelegationEventsByAddresses';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressDelegationHistoryCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { ApiError } from 'modules/app/api/ApiError';
import { isValidAddressParam } from 'pages/api/polling/isValidAddressParam';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // validate network
  const network = validateQueryParam(
    (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network,
    'string',
    {
      defaultValue: null,
      validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
    }
  ) as SupportedNetworks;

  if (!network) {
    throw new ApiError('Invalid network', 400, 'Invalid network');
  }

  if (!req.query.address) {
    throw new ApiError('Address stats, missing address', 400, 'Missing address');
  }

  if (!isValidAddressParam(req.query.address as string)) {
    throw new ApiError('Invalid address', 400, 'Invalid address');
  }

  const address = req.query.address as string;

  const cacheKey = getAddressDelegationHistoryCacheKey(address);
  const cachedResponse = await cacheGet(cacheKey, network);

  if (cachedResponse) {
    return res.status(200).json(JSON.parse(cachedResponse));
  }

  const data = await fetchDelegationEventsByAddresses([address], network);
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');

  cacheSet(cacheKey, JSON.stringify(data), network, TEN_MINUTES_IN_MS);
  res.status(200).json(data);
});
