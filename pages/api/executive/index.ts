/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { Proposal } from 'modules/executive/types';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import validateQueryParam from 'modules/app/api/validateQueryParam';

/**
 * @swagger
 * definitions:
 *   SpellData: # Copied from [proposal-id].ts for completeness
 *     type: object
 *     properties:
 *       hasBeenCast:
 *         type: boolean
 *         nullable: true
 *       hasBeenScheduled:
 *         type: boolean
 *       eta:
 *         type: string
 *         format: date-time
 *         nullable: true
 *         description: Estimated time of arrival for execution (if scheduled).
 *       expiration:
 *         type: string
 *         format: date-time
 *         nullable: true
 *         description: Time when the spell expires if not executed.
 *       nextCastTime:
 *         type: string
 *         format: date-time
 *         nullable: true
 *         description: Next possible time the spell can be cast.
 *       datePassed:
 *         type: string
 *         format: date-time
 *         nullable: true
 *         description: Date when the proposal achieved enough support.
 *       dateExecuted:
 *         type: string
 *         format: date-time
 *         nullable: true
 *         description: Date when the spell was executed.
 *       mkrSupport:
 *         type: string
 *         description: Amount of MKR supporting this spell.
 *       executiveHash:
 *         type: string
 *         nullable: true
 *         description: The hash of the executive spell.
 *       officeHours:
 *         type: boolean
 *         nullable: true
 *         description: Whether the spell is subject to office hours restrictions.
 *   ExecutiveProposal: # Copied from [proposal-id].ts for completeness
 *     type: object
 *     properties:
 *       active:
 *         type: boolean
 *       address:
 *         type: string
 *         format: address
 *       key:
 *         type: string
 *         description: Unique key for the proposal (slugified title).
 *       proposalBlurb:
 *         type: string
 *         description: A short summary or blurb for the proposal.
 *       title:
 *         type: string
 *       date:
 *         type: string
 *         description: Publication date of the proposal.
 *       proposalLink:
 *         type: string
 *         format: url
 *         description: Link to the raw proposal content (e.g., GitHub markdown file).
 *       content:
 *         type: string
 *         nullable: true
 *         description: HTML content of the proposal.
 *       spellData:
 *         $ref: '#/definitions/SpellData'
 *
 * /api/executive:
 *   get:
 *     tags:
 *     - "executive"
 *     summary: Returns a list of executive proposals.
 *     description: Retrieves a paginated and sortable list of executive proposals, potentially filtered by date range.
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "network"
 *       in: "query"
 *       description: "The Ethereum network to query."
 *       required: false
 *       schema:
 *         type: "string"
 *         enum: ["mainnet", "tenderly"]
 *         default: "mainnet"
 *     - name: "start"
 *       in: "query"
 *       description: "Start index for pagination."
 *       required: false
 *       schema:
 *         type: "integer"
 *         default: 0
 *     - name: "limit"
 *       in: "query"
 *       description: "Number of proposals to return."
 *       required: false
 *       schema:
 *         type: "integer"
 *         default: 5
 *         maximum: 30
 *     - name: "sortBy"
 *       in: "query"
 *       description: "Field to sort proposals by."
 *       required: false
 *       schema:
 *         type: "string"
 *         enum: ["date", "mkr", "active"]
 *         default: "active"
 *     - name: "startDate"
 *       in: "query"
 *       description: "Filter proposals to include those on or after this Unix timestamp."
 *       required: false
 *       schema:
 *         type: "integer"
 *         default: 0
 *     - name: "endDate"
 *       in: "query"
 *       description: "Filter proposals to include those on or before this Unix timestamp."
 *       required: false
 *       schema:
 *         type: "integer"
 *         default: 0
 *     responses:
 *       '200':
 *         description: "A list of executive proposals."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/definitions/ExecutiveProposal'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<Proposal[]>) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const start = validateQueryParam(req.query.start, 'number', {
    defaultValue: 0,
    minValue: 0
  }) as number;

  const limit = validateQueryParam(req.query.limit, 'number', {
    defaultValue: 5,
    minValue: 1,
    maxValue: 30
  }) as number;

  const sortBy = validateQueryParam(req.query.sortBy, 'string', {
    defaultValue: 'active',
    validValues: ['date', 'mkr', 'active']
  });

  const startDate = validateQueryParam(req.query.startDate, 'number', {
    defaultValue: 0
  }) as number;

  const endDate = validateQueryParam(req.query.endDate, 'number', {
    defaultValue: 0
  }) as number;

  const response = await getExecutiveProposals({
    start,
    limit,
    startDate,
    endDate,
    network: network as SupportedNetworks,
    ...(sortBy !== null && { sortBy: sortBy as 'date' | 'mkr' | 'active' })
  });

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(response);
});
