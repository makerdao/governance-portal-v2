/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSingleDelegateInfo } from 'modules/delegates/api/fetchDelegates';
import { DelegateInfo } from 'modules/delegates/types';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { validateAddress } from 'modules/web3/api/validateAddress';
import { ApiError } from 'modules/app/api/ApiError';

/**
 * @swagger
 * paths:
 *  /api/delegates/{address}/info:
 *    get:
 *      tags:
 *        - "delegates"
 *      description: Returns a delegate's name and metrics
 *      summary: Returns name and metrics for a delegate
 *      parameters:
 *        - name: network
 *          in: query
 *          description: The network for which to fetch the delegate names and metrics
 *          schema:
 *            type: string
 *            enum: [tenderly, mainnet]
 *          default: mainnet
 *        - name: address
 *          in: path
 *          description: The contract address of the delegate to fetch results for
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: A delegate entry with their name and metrics for the given network, or null if not found.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/definitions/DelegateInfo'
 *                nullable: true
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
 *        description: The delegate's contract address
 *      voteDelegateAddress:
 *        type: string
 *        description: The address the delegate uses for voting
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
 */

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<DelegateInfo | null>) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const address = await validateAddress(
    req.query.address as string,
    new ApiError('Delegate name and metrics by address, Invalid address', 400, 'Invalid address')
  );

  const delegate = await fetchSingleDelegateInfo(address, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(delegate);
});
