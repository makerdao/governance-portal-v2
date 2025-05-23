/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegatedTo } from 'modules/delegates/api/fetchDelegatedTo';
import { DelegateInfo, DelegationHistory } from 'modules/delegates/types';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';
import { fetchDelegatesInfo } from 'modules/delegates/api/fetchDelegates';
import { formatEther, parseEther } from 'viem';

/**
 * @swagger
 * /api/address/{address}/delegations:
 *  get:
 *    tags:
 *      - "address"
 *    description: Returns a list of delegates an address has delegated to along with the delegations for each delegate
 *    summary: Returns the list of delegations for an address
 *    parameters:
 *      - in: path
 *        name: address
 *        description: Address to check
 *        schema:
 *          type: string
 *        required: true
 *      - in: query
 *        name: network
 *        description: The network for which to fetch de delegations and delegates
 *        schema:
 *          type: string
 *          enum: [tenderly, mainnet]
 *        default: mainnet
 *    responses:
 *      200:
 *        description: A list of delegates an address has delegated to along with the delegations for each delegate
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/SKYAddressDelegationsAPIResponse'
 * definitions:
 *  DelegateInfo:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *      picture:
 *        type: string
 *        nullable: true
 *      address:
 *        type: string
 *        description: The address the delegate uses for voting
 *      voteDelegateAddress:
 *        type: string
 *        description: The delegate's contract address
 *      status:
 *        type: string
 *        enum:
 *          - aligned
 *          - shadow
 *      pollParticipation:
 *        type: string
 *        nullable: true
 *      executiveParticipation:
 *        type: string
 *        nullable: true
 *      combinedParticipation:
 *        type: string
 *        nullable: true
 *      communication:
 *        type: string
 *        nullable: true
 *      blockTimestamp:
 *        type: string
 *        format: date-time
 *        description: The timestamp when the delegate was last updated or created
 *      tags:
 *        type: array
 *        items:
 *          type: string
 *        nullable: true
 *    required:
 *      - name
 *      - address
 *      - voteDelegateAddress
 *      - status
 *      - blockTimestamp
 *  DelegationHistoryEvent:
 *    type: object
 *    properties:
 *      lockAmount:
 *        type: string
 *        description: The amount of SKY locked or unlocked in this event
 *      blockTimestamp:
 *        type: string
 *        format: date-time
 *        description: Timestamp of the block in which the event occurred
 *      hash:
 *        type: string
 *        description: Transaction hash of the delegation event
 *      isStakingEngine:
 *        type: boolean
 *        description: Whether this event was a lockstake event
 *        nullable: true
 *  DelegationHistory:
 *    type: object
 *    properties:
 *      address:
 *        type: string
 *        description: The address of the delegate
 *      lockAmount:
 *        type: string
 *        description: The total amount of SKY currently delegated to this delegate by the queried address (as a string formatted Ether value)
 *      events:
 *        type: array
 *        items:
 *          $ref: '#/definitions/DelegationHistoryEvent'
 *  SKYAddressDelegationsAPIResponse:
 *    type: object
 *    properties:
 *      totalDelegated:
 *        type: number
 *      delegatedTo:
 *        type: array
 *        items:
 *          $ref: '#/definitions/DelegationHistory'
 *      delegates:
 *        type: array
 *        items:
 *          $ref: '#/definitions/DelegateInfo'
 */

export type SKYAddressDelegationsAPIResponse = {
  totalDelegated: number;
  delegatedTo: DelegationHistory[];
  delegates: DelegateInfo[];
};

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<SKYAddressDelegationsAPIResponse>) => {
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

    // filter out duplicate txs
    const txHashes = {};
    const filtered = delegatedTo
      .filter(historyItem => {
        let duplicateFound = false;
        historyItem.events.forEach(event => {
          if (txHashes[event.hash]) duplicateFound = true;
          txHashes[event.hash] = true;
        });
        return !duplicateFound;
      })
      .map(({ address, lockAmount, events }) => ({ address, lockAmount, events }));

    const delegatesInfo = await fetchDelegatesInfo(network, false);
    const delegatesDelegatedTo = delegatesInfo.filter(({ voteDelegateAddress }) =>
      filtered.some(({ address }) => address.toLowerCase() === voteDelegateAddress.toLowerCase())
    );

    const totalDelegated = filtered.reduce((prev, next) => {
      return prev + parseEther(next.lockAmount);
    }, 0n);

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json({
      totalDelegated: +formatEther(totalDelegated),
      delegatedTo: filtered,
      delegates: delegatesDelegatedTo
    });
  }
);
