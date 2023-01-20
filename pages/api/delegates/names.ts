/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { fetchDelegatesInformation } from 'modules/delegates/api/fetchDelegates';
import { Delegate } from 'modules/delegates/types';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import { ApiError } from 'modules/app/api/ApiError';

// Returns only the onchain + github info of delegates,
// Does not return stats or poll vote history
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<Delegate[]>) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;

  // validate network
  if (!isSupportedNetwork(network)) {
    throw new ApiError('Invalid network', 400, 'Invalid network');
  }

  const delegates = await fetchDelegatesInformation(network);

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).json(delegates);
});
