/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { getMessageFromCode, errorCodes } from 'eth-rpc-errors';
import { getRelayerBalance } from 'modules/polling/api/getRelayerBalance';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { ApiError } from 'modules/app/api/ApiError';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
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

    const balance = await getRelayerBalance(network);

    return res.status(200).json(balance);
  } catch (err) {
    const errorMessage =
      'code' in err &&
      [...Object.values(errorCodes.provider), ...Object.values(errorCodes.rpc)].includes(err['code'])
        ? getMessageFromCode(err['code'])
        : err.message;

    throw new ApiError(`Relayer balance: ${errorMessage}`, 500, errorMessage);
  }
});
