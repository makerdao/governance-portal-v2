/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { getExecutiveProposal } from 'modules/executive/api/fetchExecutives';
import { Proposal as ExecutiveProposalType } from 'modules/executive/types'; // Renamed to avoid conflict
import { NotFoundResponse } from 'modules/app/types/genericApiResponse';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { ApiError } from 'modules/app/api/ApiError';

/**
 * @swagger
 * definitions:
 *   SpellData:
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
 *   ExecutiveProposal:
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
 *     example:
 *       active: true
 *       address: "0x123abc456def7890123abc456def7890123abc45"
 *       key: "mip100-super-cool-feature"
 *       proposalBlurb: "This proposal introduces a super cool feature."
 *       title: "MIP100: Super Cool Feature Implementation"
 *       date: "2023-10-26T10:00:00Z" # Example ISO string
 *       proposalLink: "https://raw.githubusercontent.com/makerdao/executive-votes/main/SOMETHING.md"
 *       content: "<h1>Hello World</h1><p>This is the content.</p>"
 *       spellData:
 *         hasBeenScheduled: true
 *         mkrSupport: "150000.75"
 *         eta: "2023-10-28T12:00:00Z"
 *
 * /api/executive/{proposal-id}:
 *   get:
 *     tags:
 *     - "executive"
 *     summary: Returns an executive proposal detail by its ID (key or address).
 *     description: Fetches the details of a specific executive proposal, including its content and spell data.
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - name: proposal-id
 *         in: path
 *         description: The unique identifier of the executive proposal (can be its key/slug or contract address).
 *         required: true
 *         schema:
 *           type: string
 *       - name: network
 *         in: query
 *         description: The Ethereum network to query.
 *         required: false
 *         schema:
 *           type: string
 *           enum: [mainnet, tenderly]
 *           default: mainnet
 *     responses:
 *       '200':
 *         description: "Detailed information about the executive proposal."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ExecutiveProposal'
 *       '404':
 *         description: "Proposal not found."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/NotFoundResponse' # Assuming NotFoundResponse is defined elsewhere or a generic error
 * definitions:
 *   NotFoundResponse: # Placeholder definition
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *       code:
 *         type: integer
 */
export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<ExecutiveProposalType | NotFoundResponse>) => {
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

    // TODO what kind of validation can we apply on the proposal-id?
    const proposalId = req.query['proposal-id'] as string;

    const response = await getExecutiveProposal(proposalId, network);

    if (!response) {
      throw new ApiError(`GET /api/executive/${proposalId}`, 404, 'Proposal not found');
    }

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
    res.status(200).json(response);
  }
);
