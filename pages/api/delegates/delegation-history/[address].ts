/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

/**
 * @swagger
 * /api/delegates/delegation-history/{address}:
 *   get:
 *     tags:
 *       - "delegates"
 *     summary: Get delegation event history for a specific delegate address.
 *     description: Returns a list of delegation events (locks/unlocks) where the specified address is the delegate.
 *     parameters:
 *       - name: address
 *         in: path
 *         description: The delegate's contract address.
 *         required: true
 *         schema:
 *           type: string
 *           format: address
 *       - name: network
 *         in: query
 *         description: The Ethereum network to query.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [mainnet, tenderly]
 *           default: mainnet
 *     responses:
 *       200:
 *         description: A list of delegation events for the specified delegate.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/DelegationEventDetail'
 * definitions:
 *   DelegationEventDetail: # Corresponds to the transformed MKRLockedDelegateAPIResponse
 *     type: object
 *     properties:
 *       immediateCaller:
 *         type: string
 *         format: address
 *         description: The address of the account that performed the delegation/undelegation.
 *       delegateContractAddress:
 *         type: string
 *         format: address
 *         description: The contract address of the delegate.
 *       lockAmount:
 *         type: string
 *         description: The amount of MKR involved in this specific event (e.g., amount locked or unlocked). Formatted as an Ether string.
 *       blockNumber:
 *         type: number
 *         description: The block number in which this event occurred.
 *       blockTimestamp:
 *         type: string
 *         format: date-time
 *         description: The timestamp of the block for this event.
 *       callerLockTotal:
 *         type: string
 *         description: The total amount of MKR delegated by the immediateCaller to this delegateContractAddress after this event. Formatted as an Ether string.
 *       hash:
 *         type: string
 *         description: The transaction hash of the event.
 *       isStakingEngine:
 *         type: boolean
 *         nullable: true
 *         description: Indicates if the event was related to a lockstake operation.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { fetchDelegationEventsByAddresses } from 'modules/delegates/api/fetchDelegationEventsByAddresses';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { getAddressDelegationHistoryCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';
import { ApiError } from 'modules/app/api/ApiError';
import { validateAddress } from 'modules/web3/api/validateAddress';

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

  const address = await validateAddress(
    req.query.address as string,
    new ApiError('Invalid address', 400, 'Invalid address')
  );

  const cacheKey = getAddressDelegationHistoryCacheKey(address);
  const cachedResponse = await cacheGet(cacheKey, network);

  if (cachedResponse) {
    return res.status(200).json(JSON.parse(cachedResponse));
  }

  const data = await fetchDelegationEventsByAddresses([address], network);
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');

  cacheSet(cacheKey, JSON.stringify(data), network, TEN_MINUTES_IN_MS);
  res.status(200).json(data);
});
