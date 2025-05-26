/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { fetchDelegatesPaginated } from 'modules/delegates/api/fetchDelegates';
import { DelegatesPaginatedAPIResponse } from 'modules/delegates/types';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import {
  DelegateOrderByEnum,
  DelegateTypeEnum,
  OrderDirectionEnum
} from 'modules/delegates/delegates.constants';
import withApiHandler from 'modules/app/api/withApiHandler';
import validateQueryParam from 'modules/app/api/validateQueryParam';

/**
 * @swagger
 * paths:
 *   /api/delegates:
 *     get:
 *       tags:
 *         - "delegates"
 *       description: Returns a paginated list of delegates according to the specified filters and sorting.
 *       summary: Returns a paginated list of delegates
 *       produces:
 *         - "application/json"
 *       parameters:
 *         - name: network
 *           in: query
 *           description: The network to query the delegates for. Defaults to mainnet.
 *           schema:
 *             type: string
 *             enum: [tenderly, mainnet]
 *           default: "mainnet"
 *         - name: pageSize
 *           in: query
 *           description: The number of delegates to return per page. Defaults to 20.
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 30
 *           default: 20
 *         - name: page
 *           in: query
 *           description: The page number to return. Defaults to 1.
 *           schema:
 *             type: integer
 *             minimum: 1
 *           default: 1
 *         - name: orderBy
 *           description: The field to sort the delegates by. Defaults to DATE.
 *           in: query
 *           schema:
 *             type: string
 *             enum: [MKR, DELEGATORS, DATE, RANDOM]
 *           default: DATE
 *         - name: orderDirection
 *           description: The order direction for the sorting. Defaults to DESC.
 *           in: query
 *           schema:
 *             type: string
 *             enum: [ASC, DESC]
 *           default: DESC
 *         - name: seed
 *           description: The seed to use for the random ordering, only relevant when sorting delegates by RANDOM.
 *           in: query
 *           schema:
 *             type: number
 *             minimum: -1
 *             maximum: 1
 *         - name: delegateType
 *           description: The type of delegates to return. Defaults to ALL.
 *           in: query
 *           schema:
 *             type: string
 *             enum: [ALIGNED, SHADOW, ALL]
 *           default: ALL
 *         - name: searchTerm
 *           description: Name or address (whole or part) of the delegate to return.
 *           in: query
 *           schema:
 *             type: string
 *       responses:
 *         200:
 *           description: A paginated list of delegates matching the specified filters and sorting.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   paginationInfo:
 *                     type: object
 *                     properties:
 *                       totalCount:
 *                         type: number
 *                         description: Total number of delegates matching the filters
 *                       page:
 *                         type: number
 *                         description: Current page number
 *                       numPages:
 *                         type: number
 *                         description: Total number of pages
 *                       hasNextPage:
 *                         type: boolean
 *                         description: Whether there are more pages available
 *                   stats:
 *                     type: object
 *                     properties:
 *                       total:
 *                         type: number
 *                         description: Total number of delegates
 *                       shadow:
 *                         type: number
 *                         description: Number of shadow delegates
 *                       aligned:
 *                         type: number
 *                         description: Number of aligned delegates
 *                       totalSkyDelegated:
 *                         type: string
 *                         description: Total amount of SKY delegated
 *                       totalDelegators:
 *                         type: number
 *                         description: Total number of delegators
 *                   delegates:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: Name of the delegate
 *                         voteDelegateAddress:
 *                           type: string
 *                           description: Contract address of the delegate
 *                         address:
 *                           type: string
 *                           description: Owner address of the delegate
 *                         status:
 *                           type: string
 *                           enum: [aligned, shadow]
 *                           description: Status of the delegate
 *                         creationDate:
 *                           type: string
 *                           format: date-time
 *                           description: Date when the delegate was created
 *                         picture:
 *                           type: string
 *                           description: URL to delegate's picture
 *                         communication:
 *                           type: string
 *                           description: Communication channel of the delegate
 *                         combinedParticipation:
 *                           type: string
 *                           description: Combined participation rate
 *                         pollParticipation:
 *                           type: string
 *                           description: Poll participation rate
 *                         executiveParticipation:
 *                           type: string
 *                           description: Executive participation rate
 *                         skyDelegated:
 *                           type: string
 *                           description: Amount of SKY delegated to this delegate
 *                         delegatorCount:
 *                           type: number
 *                           description: Number of delegators
 *                         lastVoteDate:
 *                           type: string
 *                           format: date-time
 *                           description: Date of last vote
 *                         proposalsSupported:
 *                           type: number
 *                           description: Number of proposals supported
 *                         execSupported:
 *                           type: object
 *                           properties:
 *                             title:
 *                               type: string
 *                               description: Title of the supported executive
 *                             address:
 *                               type: string
 *                               description: Address of the supported executive
 *                         previous:
 *                           type: object
 *                           properties:
 *                             address:
 *                               type: string
 *                               description: Previous delegate's owner address
 *                             voteDelegateAddress:
 *                               type: string
 *                               description: Previous delegate's contract address
 *                         next:
 *                           type: object
 *                           properties:
 *                             address:
 *                               type: string
 *                               description: Next delegate's owner address
 *                             voteDelegateAddress:
 *                               type: string
 *                               description: Next delegate's contract address
 *                       required:
 *                         - name
 *                         - voteDelegateAddress
 *                         - address
 *                         - status
 *                         - creationDate
 *                         - skyDelegated
 *                         - delegatorCount
 *                         - proposalsSupported
 */

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<DelegatesPaginatedAPIResponse>) => {
    const network = validateQueryParam(req.query.network, 'string', {
      defaultValue: DEFAULT_NETWORK.network,
      validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
    }) as SupportedNetworks;

    const pageSize = validateQueryParam(req.query.pageSize, 'number', {
      defaultValue: 20,
      minValue: 1,
      maxValue: 30
    }) as number;

    const page = validateQueryParam(req.query.page, 'number', {
      defaultValue: 1,
      minValue: 1
    }) as number;

    const orderBy = validateQueryParam(req.query.orderBy, 'string', {
      defaultValue: DelegateOrderByEnum.DATE,
      validValues: [
        DelegateOrderByEnum.MKR,
        DelegateOrderByEnum.DELEGATORS,
        DelegateOrderByEnum.DATE,
        DelegateOrderByEnum.RANDOM
      ]
    }) as string;

    const orderDirection = validateQueryParam(req.query.orderDirection, 'string', {
      defaultValue: OrderDirectionEnum.DESC,
      validValues: [OrderDirectionEnum.ASC, OrderDirectionEnum.DESC]
    }) as string;

    const seed = validateQueryParam(req.query.seed, 'float', {
      defaultValue: null,
      minValue: -1,
      maxValue: 1
    }) as number | null;

    const delegateType = validateQueryParam(req.query.delegateType, 'string', {
      defaultValue: DelegateTypeEnum.ALL,
      validValues: [DelegateTypeEnum.ALIGNED, DelegateTypeEnum.SHADOW, DelegateTypeEnum.ALL]
    }) as DelegateTypeEnum;

    const searchTerm = validateQueryParam(req.query.searchTerm, 'string', {
      defaultValue: null
    }) as string | null;

    const delegates = await fetchDelegatesPaginated({
      network,
      pageSize,
      page,
      orderBy,
      orderDirection,
      seed,
      delegateType,
      searchTerm
    });

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json(delegates);
  }
);
