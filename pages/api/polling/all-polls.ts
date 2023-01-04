/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { getPolls } from 'modules/polling/api/fetchPolls';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import validateQueryParam from 'modules/app/api/validateQueryParam';

/**
 * @swagger
 * definitions:
 *   ArrayOfPolls:
 *     type: array
 *     items:
 *       $ref: '#/definitions/Poll'
 *   PollStats:
 *     type: object
 *     properties:
 *       active:
 *         type: integer
 *       finished:
 *         type: integer
 *       total:
 *         type: integer
 *     example:
 *       - active: 10
 *         finished: 10
 *         total: 10
 *
 * /api/polling/all-polls:
 *   get:
 *     tags:
 *     - "polls"
 *     description: Returns all polls
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "tags"
 *       in: "query"
 *       description: "tags to filter polls by. Example 'collateral', 'greenlight'"
 *       required: false
 *       type: "array"
 *       items:
 *         type: "string"
 *         enum:
 *         - "collateral"
 *         - "greenlight"
 *         - "governance"
 *         default: ""
 *       collectionFormat: "multi"
 *     responses:
 *       '200':
 *         description: "List of polls"
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 polls:
 *                   $ref: '#/definitions/ArrayOfPolls'
 *                 stats:
 *                   $ref: '#/definitions/PollStats'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const startDate = validateQueryParam(req.query.startDate, 'date', {
    defaultValue: null
  }) as Date | null;

  const endDate = validateQueryParam(req.query.endDate, 'date', {
    defaultValue: null
  }) as Date | null;

  const filters = {
    startDate,
    endDate,
    tags: req.query.tags ? (typeof req.query.tags === 'string' ? [req.query.tags] : req.query.tags) : null
  };

  const pollsResponse = await getPolls(filters, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(pollsResponse);
});
