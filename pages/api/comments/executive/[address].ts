/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { getExecutiveComments } from 'modules/comments/api/getExecutiveComments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';

/**
 * @swagger
 * definitions:
 *   ExecutiveComment:
 *     type: object
 *     properties:
 *       network:
 *         type: number
 *         enum: ['mainnet', 'tenderly']
 *       spellAddress:
 *         type: string
 *       comment:
 *         type: string
 *       date:
 *         type: string
 *       voterAddress:
 *         type: string
 *       delegateAddress:
 *         type: string
 *       voterWeight:
 *         type: string
 *     example:
 *       - spellAddress: "0x123123123123"
 *         comment: 'This is a great comment'
 *         network: "mainnet"
 *         date: "2021-12-15T11:11:23.841Z"
 *         voterAddress: "0x123123212"
 *         delegateAddress: "0x12312321321"
 *         voterWeight: "4.223"
 *
 * /api/comments/executive/{address}:
 *   get:
 *     tags:
 *     - "comments"
 *     summary: Returns all the comments for an executive
 *     description: Returns all the comments for an executive
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Proposal address
 *     responses:
 *       '200':
 *         description: "Comments of an executive"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   comment:
 *                     $ref: '#/definitions/ExecutiveComment'
 *                   address:
 *                     $ref: '#/definitions/Address'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
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

  // validate address
  const address = await validateAddress(
    req.query.address as string,
    new ApiError('Invalid address', 400, 'Invalid address')
  );

  const response = await getExecutiveComments(address, network);
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');

  res.status(200).json(response);
});
