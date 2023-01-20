/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { CommentsAPIResponseItem } from 'modules/comments/types/comments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getCommentsByAddress } from 'modules/comments/api/getCommentsByAddress';
import { ApiError } from 'modules/app/api/ApiError';
import { isValidAddressParam } from 'pages/api/polling/isValidAddressParam';
import validateQueryParam from 'modules/app/api/validateQueryParam';

export default withApiHandler(
  async (
    req: NextApiRequest,
    res: NextApiResponse<{
      comments: CommentsAPIResponseItem[];
    }>
  ) => {
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
    const response = await getCommentsByAddress(address, network);
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    res.status(200).json(response);
  }
);
