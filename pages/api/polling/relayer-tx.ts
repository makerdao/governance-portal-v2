/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { getMessageFromCode, ERROR_CODES } from 'eth-rpc-errors';
import { getRelayerTx } from 'modules/polling/api/getRelayerTx';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { ApiError } from 'modules/app/api/ApiError';
import { isValidRelayerTxIdParam } from '../../../modules/polling/helpers/isValidRelayerTxIdParam';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // validate network
    const network = validateQueryParam(
      (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network,
      'string',
      {
        defaultValue: null,
        validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
      },
      n => !!n,
      new ApiError('Invalid network', 400, 'Invalid network')
    ) as SupportedNetworks;

    // validate pollId
    const txId = validateQueryParam(
      req.query.txId,
      'string',
      {
        defaultValue: null
      },
      isValidRelayerTxIdParam,
      new ApiError('Invalid tx id', 400, 'Invalid tx id')
    ) as string;

    const tx = await getRelayerTx(txId, network);

    return res.status(200).json(tx);
  } catch (err) {
    const errorMessage =
      'code' in err &&
      [...Object.values(ERROR_CODES.provider), ...Object.values(ERROR_CODES.rpc)].includes(err['code'])
        ? getMessageFromCode(err['code'])
        : err.message;

    throw new ApiError(`Relayer tx: ${errorMessage}`, 500, errorMessage);
  }
});
