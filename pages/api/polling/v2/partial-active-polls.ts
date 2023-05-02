/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { getPartialActivePolls } from 'modules/polling/api/fetchPolls';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { PartialActivePoll } from 'modules/polling/types';

/**
 * @swagger
 * paths:
 *  /api/polling/v2/partial-active-polls:
 *    get:
 *      tags:
 *        - "polls"
 *      description: Returns the list of poll ids and end dates for active polls.
 *      produces:
 *        - "application/json"
 *      parameters:
 *        - name: network
 *          in: query
 *          description: The network to query the polls for. Defaults to mainnet.
 *          schema:
 *            type: string
 *            enum: [goerli, goerlifork, mainnet]
 *          default: "mainnet"
 *      responses:
 *        200:
 *          description: A list with the poll ids and end dates for all of the active polls for the given network.
 *          content:
 *            application/json:
 *              type: array
 *              items:
 *                schema:
 *                  $ref: '#/components/schemas/PartialActivePoll'
 * components:
 *  schemas:
 *    PartialActivePoll:
 *      type: object
 *      properties:
 *        pollId:
 *          type: number
 *        endDate:
 *          type: string
 *          format: date-time
 */

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<PartialActivePoll[]>) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const pollsResponse = await getPartialActivePolls(network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(pollsResponse);
});
