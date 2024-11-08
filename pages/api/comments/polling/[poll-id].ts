/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { PollCommentsAPIResponseItem } from 'modules/comments/types/comments';
import { getPollComments } from 'modules/comments/api/getPollComments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';

/**
 * @swagger
 * definitions:
 *   PollingComment:
 *     type: object
 *     properties:
 *       network:
 *         type: number
 *         enum: ['mainnet', 'tenderly']
 *       pollId:
 *         type: number
 *       comment:
 *         type: string
 *       date:
 *         type: string
 *       voterAddress:
 *         type: string
 *       delegateAddress:
 *         type: string
 *     example:
 *       - pollId: 4
 *         comment: 'This is a great comment'
 *         network: "mainnet"
 *         date: "2021-12-15T11:11:23.841Z"
 *         voterAddress: "0x123123212"
 *         delegateAddress: "0x12312321321"
 *
 * /api/comments/polling/{pollId}:
 *   get:
 *     tags:
 *     - "comments"
 *     summary: Returns all the comments for a poll
 *     description: Returns all the comments for a poll
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: pollId
 *         schema:
 *           type: number
 *         required: true
 *         description: Poll Id
 *     responses:
 *       '200':
 *         description: "Comments of a poll"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   comment:
 *                     $ref: '#/definitions/PollingComment'
 *                   address:
 *                     $ref: '#/definitions/Address'
 */
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<PollCommentsAPIResponseItem[]>) => {
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

    // validate pollId
    const pollId = validateQueryParam(
      req.query['poll-id'],
      'number',
      {
        defaultValue: null,
        minValue: 0
      },
      n => !!n,
      new ApiError('Invalid poll id', 400, 'Invalid poll id')
    ) as number;

    const response = await getPollComments(pollId, network);

    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    // only return the latest comment from each address
    return res.status(200).json(response);
  }
);
