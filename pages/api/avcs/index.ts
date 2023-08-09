/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import validateQueryParam from 'modules/app/api/validateQueryParam';
import withApiHandler from 'modules/app/api/withApiHandler';
import { fetchAvcs } from 'modules/avcs/api/fetchAvcs';
import { AvcOrderByEnum } from 'modules/avcs/avcs.constants';
import { AvcsAPIResponse } from 'modules/avcs/types/avc';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * @swagger
 * paths:
 *  /api/avcs:
 *    get:
 *      tags:
 *        - "AVCs"
 *      description: Returns a list of AVCs according to the specified filters and sorting.
 *      summary: Returns a list of AVCs
 *      produces:
 *        - "application/json"
 *      parameters:
 *         - name: network
 *           in: query
 *           description: The network to query the AVCs for. Defaults to mainnet.
 *           schema:
 *             type: string
 *             enum: [goerli, goerlifork, mainnet]
 *           default: "mainnet"
 *         - name: orderBy
 *           description: The field to sort the AVCs by. Defaults to RANDOM.
 *           in: query
 *           schema:
 *             type: string
 *             enum: [DELEGATES, MKR_DELEGATED, RANDOM]
 *           default: RANDOM
 *         - name: searchTerm
 *           description: Name (whole or part) of the AVCs to return.
 *           in: query
 *           schema:
 *             type: string
 *      responses:
 *        200:
 *          description: A list of AVCs matching the specified filters and sorting.
 *          content:
 *            application/json:
 *              schema:
 *                #ref: '#/components/schemas/AvcsAPIResponse'
 * components:
 *  schemas:
 *    Avc:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        name:
 *          type: string
 *        picture:
 *          type: string
 *        externalUrl:
 *          type: string
 *        description:
 *          type: string
 *        mkrDelegated:
 *          type: string
 *        delegateCount:
 *          type: number
 *      required:
 *        - name
 *        - description
 *        - mkrDelegated
 *        - delegateCount
 *    AvcsAPIResponse:
 *      type: object
 *      properties:
 *        stats:
 *          type: object
 *          properties:
 *            totalCount:
 *              type: number
 *        avcs:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Avc'
 */

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<AvcsAPIResponse>) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const orderBy = validateQueryParam(req.query.orderBy, 'string', {
    defaultValue: AvcOrderByEnum.RANDOM,
    validValues: [AvcOrderByEnum.DELEGATES, AvcOrderByEnum.MKR_DELEGATED, AvcOrderByEnum.RANDOM]
  }) as AvcOrderByEnum;

  const searchTerm = validateQueryParam(req.query.searchTerm, 'string', {
    defaultValue: null
  }) as string | null;

  const avcs = await fetchAvcs({
    network,
    orderBy,
    searchTerm
  });

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(avcs);
});
