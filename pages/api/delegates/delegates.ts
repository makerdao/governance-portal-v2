/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegatesPaginated } from 'modules/delegates/api/fetchDelegates';
import { DelegatesAPIResponse } from 'modules/delegates/types';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<DelegatesAPIResponse>) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const first = validateQueryParam(req.query.first, 'number', {
    defaultValue: 20,
    minValue: 1,
    maxValue: 30
  }) as number;

  const after = validateQueryParam(req.query.after, 'string', {
    defaultValue: null
  }) as string | null;

  const includeExpired = validateQueryParam(req.query.includeExpired, 'boolean', {
    defaultValue: false
  }) as boolean;

  const orderBy = validateQueryParam(req.query.orderBy, 'string', {
    defaultValue: 'DATE',
    validValues: ['MKR', 'DELEGATORS', 'DATE']
  }) as string;

  const orderDirection = validateQueryParam(req.query.orderDirection, 'string', {
    defaultValue: 'DESC',
    validValues: ['ASC', 'DESC']
  }) as string;

  const status = validateQueryParam(req.query.status, 'string', {
    defaultValue: 'ALL',
    validValues: ['RECOGNIZED', 'SHADOW', 'ALL']
  }) as string;

  const validatedQueryParams = { network, first, after, includeExpired, orderBy, orderDirection, status };

  const delegates = await fetchDelegatesPaginated(validatedQueryParams);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).json(delegates);
});
