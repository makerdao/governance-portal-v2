/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';
import { getAddressInfo } from 'modules/address/api/getAddressInfo';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { resolveENS } from 'modules/web3/helpers/ens';
import { ApiError } from 'modules/app/api/ApiError';
import { isValidAddressParam } from 'pages/api/polling/isValidAddressParam';

/**
 * @swagger
 * definitions:
 *   Address:
 *     type: object
 *     properties:
 *       isDelegate:
 *         type: boolean
 *       isProxyContract:
 *         type: boolean
 *       address:
 *         type: string
 *       delegateInfo:
 *         type: object
 *         properties:
 *           voteDelegateAddress:
 *             type: string
 *           id:
 *             type: string
 *           mkrDelegated:
 *             type: number
 *     example:
 *       - address: "0x7a1231231312d76A2aff3b1231231230A4"
 *         isDelegate: true
 *         isProxyContract: false
 *         delegateInfo:
 *           mkrDelegated: 5
 *           voteDelegateAddress: "0x123123213213"
 * /api/address/{address}:
 *   get:
 *     tags:
 *     - "address"
 *     description: Returns the address info
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: address to check
 *     responses:
 *       '200':
 *         description: "Detail of an address"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Address'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AddressApiResponse>) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;

  // validate network
  if (!isSupportedNetwork(network)) {
    throw new ApiError('Invalid network', 400, 'Invalid network');
  }

  // validate address
  if (!req.query.address) {
    throw new ApiError('Address stats, missing address', 400, 'Missing address');
  }

  if (!isValidAddressParam(req.query.address as string)) {
    throw new ApiError('Invalid address', 400, 'Invalid address');
  }
  const tempAddress = req.query.address as string;

  const address = tempAddress.indexOf('.eth') !== -1 ? await resolveENS(tempAddress) : tempAddress;
  const response = await getAddressInfo(address ?? tempAddress, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
