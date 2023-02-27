/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSingleDelegateNameAndMetrics } from 'modules/delegates/api/fetchDelegates';
import { DelegateNameAndMetrics } from 'modules/delegates/types';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';
import { ApiError } from 'modules/app/api/ApiError';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<DelegateNameAndMetrics | null>) => {
    const network = validateQueryParam(req.query.network, 'string', {
      defaultValue: DEFAULT_NETWORK.network,
      validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
    }) as SupportedNetworks;

    const address = await validateAddress(
      req.query.address as string,
      new ApiError('Delegate name and metrics by address, Invalid address', 400, 'Invalid address')
    );

    const delegate = await fetchSingleDelegateNameAndMetrics(address, network);

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json(delegate);
  }
);
