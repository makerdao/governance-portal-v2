/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/**
 * @swagger
 * /api/executive/supporters:
 *   get:
 *     summary: Get the supporters of all executive spells
 *     description: Returns the list of supporters for each executive spell. Supports mainnet, goerli and goerlifork networks.
 *     tags:
 *       - Executive
 *     parameters:
 *       - name: network
 *         in: query
 *         description: The Ethereum network to use.
 *         schema:
 *           type: string
 *         enum:
 *           - goerli
 *           - goerlifork
 *           - mainnet
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 {EXECUTIVE_SPELL}:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       address:
 *                         type: string
 *                       support:
 *                         type: string
 *                       votes:
 *                         type: string
 *                       percent:
 *                         type: string
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '500':
 *         $ref: '#/components/responses/InternalServerError'
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { getContracts } from 'modules/web3/helpers/getContracts';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { fetchExecutiveVoteTally } from 'modules/executive/api/fetchExecutiveVoteTally';
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
      validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
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

  const chief = getContracts(networkNameToChainId(network), undefined, undefined, true).chief;
  const allSupporters = await fetchExecutiveVoteTally(chief);

  // handle percent and check address
  Object.keys(allSupporters).forEach(spell => {
    allSupporters[spell].forEach(supporter => {
      if (supporter.percent === 'NaN') supporter.percent = '0';
    });
  });

  cacheSet(executiveSupportersCacheKey, JSON.stringify(allSupporters), network, FIVE_MINUTES_IN_MS);
  res.status(200).json(allSupporters);
});
