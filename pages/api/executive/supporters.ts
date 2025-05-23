/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/**
 * @swagger
 * /api/executive/supporters:
 *   get:
 *     summary: Get the supporters of all executive spells.
 *     description: Returns an object where keys are executive spell addresses and values are lists of supporters for each spell. Supports mainnet and tenderly networks.
 *     tags:
 *       - executive
 *     parameters:
 *       - name: network
 *         in: query
 *         description: The Ethereum network to use.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [mainnet, tenderly]
 *           default: mainnet
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: A map where keys are executive spell contract addresses.
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   $ref: '#/definitions/SupporterDetail'
 *       '400':
 *         description: Bad request (e.g., invalid network parameter).
 *       '500':
 *         description: Internal server error.
 * definitions:
 *   SupporterDetail:
 *     type: object
 *     properties:
 *       address:
 *         type: string
 *         format: address
 *         description: Address of the supporter.
 *       deposits:
 *         type: string
 *         description: Amount of SKY the supporter has staked/voted with for this spell.
 *       percent:
 *         type: string
 *         description: Percentage of total support this supporter represents for the spell (e.g., "55.5", can be "0" if calculation resulted in NaN).
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { fetchExecutiveVoteTallyWithSubgraph } from 'modules/executive/api/fetchExecutiveVoteTallyWithSubgraph';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { executiveSupportersCacheKey } from 'modules/cache/constants/cache-keys';
import { FIVE_MINUTES_IN_MS } from 'modules/app/constants/time';
import { ApiError } from 'modules/app/api/ApiError';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // validate network
  const network = validateQueryParam(
    (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network,
    'string',
    {
      defaultValue: null,
      validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
    }
  ) as SupportedNetworks;

  if (!network) {
    throw new ApiError('Invalid network', 400, 'Invalid network');
  }

  const cached = await cacheGet(executiveSupportersCacheKey, network);

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

  if (cached) {
    res.status(200).json(JSON.parse(cached));
    return;
  }

  const allSupporters = await fetchExecutiveVoteTallyWithSubgraph(network);

  // handle percent and check address
  Object.keys(allSupporters).forEach(spell => {
    allSupporters[spell].forEach(supporter => {
      if (supporter.percent === 'NaN') supporter.percent = '0';
    });
  });

  cacheSet(executiveSupportersCacheKey, JSON.stringify(allSupporters), network, FIVE_MINUTES_IN_MS);
  res.status(200).json(allSupporters);
});
