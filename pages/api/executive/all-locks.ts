/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/**
 * @swagger
 * /api/executive/all-locks:
 *   get:
 *     summary: Returns the summary of all locks in the given time range for the specified network.
 *     description: Returns an array of objects containing summary of all lock events (deposits into Chief) in the given time range for the specified network.
 *     tags:
 *      - executive
 *     parameters:
 *       - name: network
 *         in: query
 *         required: false
 *         description: The network to fetch the data from. If not specified, will use the default network.
 *         schema:
 *           type: string
 *           enum: [tenderly, mainnet]
 *           default: mainnet
 *       - name: unixtimeStart
 *         in: query
 *         required: true
 *         description: The start of the time range for which to fetch the data. Unix timestamp in seconds.
 *         schema:
 *           type: number
 *       - name: unixtimeEnd
 *         in: query
 *         required: false
 *         description: The end of the time range for which to fetch the data. Unix timestamp in seconds. If not specified, will use the current time.
 *         schema:
 *           type: number
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   fromAddress:
 *                     type: string
 *                     description: The address from which the lock originated (often the same as immediateCaller).
 *                   immediateCaller:
 *                     type: string
 *                     description: The address that directly interacted with the contract for the lock.
 *                   lockAmount:
 *                     type: string
 *                     description: The amount of MKR locked in this specific event.
 *                   blockNumber:
 *                     type: string
 *                     description: The block number in which this lock event occurred.
 *                   blockTimestamp:
 *                     type: string
 *                     description: The timestamp of the block for this lock event (ISO8601 format from GraphQL).
 *                   lockTotal:
 *                     type: string
 *                     description: The total amount locked by the immediateCaller after this event.
 *                   hash:
 *                     type: string
 *                     description: Transaction hash of the lock event.
 *                   unixDate:
 *                     type: number
 *                     description: Derived Unix timestamp (seconds) of the blockTimestamp.
 *                   total:
 *                     type: string
 *                     description: Derived; lockTotal divided by 1000, formatted to zero decimal places.
 *                   month:
 *                     type: string
 *                     description: Derived; The month number (1-12) from blockTimestamp.
 *       '400':
 *         description: Bad request (e.g., missing unixtimeStart).
 *       '404':
 *         description: Not found (if data fetch returns nothing, though current code returns []).
 *       '500':
 *         description: Internal server error.
 */

import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import withApiHandler from 'modules/app/api/withApiHandler';
import fetchAllLocksSummed from 'modules/home/api/fetchAllLocksSummed';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const unixtimeStart = validateQueryParam(req.query.unixtimeStart, 'number', {
    defaultValue: 0,
    minValue: 0
  }) as number;

  const unixtimeEnd = validateQueryParam(req.query.unixtimeEnd, 'number', {
    defaultValue: 0,
    minValue: 0
  }) as number;

  invariant(unixtimeStart, 'unixtimeStart is required');

  const data = await fetchAllLocksSummed(
    network,
    unixtimeStart,
    unixtimeEnd ? unixtimeEnd : Math.floor(Date.now() / 1000)
  );

  if (!data) {
    throw new ApiError('Not found', 404);
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(data);
});
