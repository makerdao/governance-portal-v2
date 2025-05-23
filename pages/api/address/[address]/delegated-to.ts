/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegatedTo } from 'modules/delegates/api/fetchDelegatedTo';
import { DelegationHistory } from 'modules/delegates/types';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';
import { formatEther } from 'viem';
/**
 * @swagger
 * /api/address/[address]/delegated-to:
 *   get:
 *     tags:
 *       - "delegates"
 *     summary: Get information about the current delegate to SKY
 *     description: Get information about the current delegate to SKY
 *     parameters:
 *       - name: address
 *         in: query
 *         description: The Ethereum address of the account to check
 *         required: true
 *         schema:
 *           type: string
 *           format: address
 *       - name: network
 *         in: query
 *         description: The Ethereum network to query for information
 *         required: false
 *         schema:
 *           type: string
 *           enum: [mainnet, tenderly]
 *           default: mainnet
 *     responses:
 *       200:
 *         description: A response with the delegate information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 delegatedTo:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       address:
 *                         type: string
 *                         description: The address of the delegate
 *                         format: address
 *                       lockAmount:
 *                         type: number
 *                         description: The total amount of SKY delegated to this delegate by the queried address
 *                         format: float
 *                       events:
 *                         type: array
 *                         description: History of delegation events for this delegate from the queried address
 *                         items:
 *                           type: object
 *                           properties:
 *                             lockAmount:
 *                               type: string
 *                               description: The amount of SKY locked in this event
 *                             blockTimestamp:
 *                               type: string
 *                               description: Timestamp of the block in which the event occurred
 *                               format: date-time # Assuming it's an ISO string from new Date().toISOString()
 *                             hash:
 *                               type: string
 *                               description: Transaction hash of the delegation event
 *                             isStakingEngine:
 *                               type: boolean
 *                               description: Whether this event was a lockstake event
 *                               nullable: true
 *                 totalDelegated:
 *                   type: number
 *                   format: float
 *
 */

export type SKYDelegatedToAPIResponse = {
  delegatedTo: DelegationHistory[];
  totalDelegated: number;
};
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<SKYDelegatedToAPIResponse>) => {
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

    const delegatedTo = await fetchDelegatedTo(address, network);

    // filter out duplicate txs for the same address
    const txHashes = {};
    const filtered = delegatedTo.filter(historyItem => {
      let duplicateFound = false;
      historyItem.events.forEach(event => {
        const uniqueKey = `${event.hash}-${historyItem.address}`;
        if (txHashes[uniqueKey]) duplicateFound = true;
        txHashes[uniqueKey] = true;
      });
      return !duplicateFound;
    });

    const totalDelegated = filtered.reduce((prev, next) => {
      return prev + BigInt(next.lockAmount);
    }, 0n);

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json({
      delegatedTo: filtered,
      totalDelegated: +formatEther(totalDelegated)
    });
  }
);
