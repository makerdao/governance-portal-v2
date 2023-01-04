/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import withApiHandler from 'modules/app/api/withApiHandler';
import fetchAllLocksSummed from 'modules/home/api/fetchAllLocksSummed';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const unixtimeStart = validateQueryParam(req.query.unixtimeStart, 'number', {
    defaultValue: 0,
    minValue: 0
  }) as number;

  const unixtimeEnd = validateQueryParam(req.query.unixtimeEnd, 'number', {
    defaultValue: 0,
    minValue: 0
  }) as number;

  invariant(unixtimeStart, 'unixtimeStart is required');

  const data = await fetchAllLocksSummed(
    network,
    unixtimeStart,
    unixtimeEnd ? unixtimeEnd : Math.floor(Date.now() / 1000)
  );

  if (!data) {
    throw new ApiError('Not found', 404);
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(data);
});
