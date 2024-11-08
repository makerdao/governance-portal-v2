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
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';

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
        validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
      },
      n => !!n,
      new ApiError('Invalid network', 400, 'Invalid network')
    ) as SupportedNetworks;

    const address = await validateAddress(
      req.query.address as string,
      new ApiError('Invalid address', 400, 'Invalid address')
    );

    const response = await getCommentsByAddress(address, network);
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    res.status(200).json(response);
  }
);
