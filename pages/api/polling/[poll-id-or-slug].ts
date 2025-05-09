/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import withApiHandler from 'modules/app/api/withApiHandler';
import { fetchSinglePoll } from 'modules/polling/api/fetchPollBy';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { NextApiRequest, NextApiResponse } from 'next';
import { Poll } from 'modules/polling/types';

/**
 * @swagger
 * definitions:
 *   PollTag: # Definition for items in Poll.tags
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         description: Unique identifier for the tag (e.g., "core-unit-budget").
 *       shortname:
 *         type: string
 *         description: A short, display-friendly name for the tag.
 *       longname:
 *         type: string
 *         description: A longer, more descriptive name for the tag.
 *       description:
 *         type: string
 *         description: A brief description of what the tag represents.
 *   PollParametersInputFormat:
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *         description: The input format type (e.g., singleChoice, rankFree).
 *       abstain:
 *         type: array
 *         items:
 *           type: integer
 *         description: Array of option indices that represent an abstention.
 *       options:
 *         type: array
 *         items:
 *           type: integer
 *         description: Array of all available option indices (used in some formats).
 *   PollParametersVictoryCondition:
 *     type: object # This can be one of several structures, simplified here
 *     properties:
 *       type:
 *         type: string
 *         description: Type of victory condition (e.g., plurality, majority, instantRunoff).
 *       percent:
 *         type: number
 *         format: float
 *         nullable: true
 *         description: Percentage required for majority (if type is majority).
 *   PollParameters:
 *     type: object
 *     properties:
 *       inputFormat:
 *         $ref: '#/definitions/PollParametersInputFormat'
 *       victoryConditions:
 *         type: array
 *         items:
 *           $ref: '#/definitions/PollParametersVictoryCondition' # Could also be an AND condition object
 *         description: Conditions that determine the outcome of the poll.
 *       resultDisplay:
 *         type: string
 *         description: How the poll results should be displayed (e.g., singleVoteBreakdown, instantRunoffBreakdown).
 *   Poll:
 *     type: object
 *     properties:
 *       pollId:
 *         type: integer
 *       creator:
 *         type: string
 *         format: address
 *         description: Ethereum address of the poll creator.
 *       blockCreated:
 *         type: number
 *         description: Block number when the poll was created on-chain.
 *       startDate:
 *         type: string
 *         format: date-time
 *         description: ISO8601 string representing the start date of the poll.
 *       endDate:
 *         type: string
 *         format: date-time
 *         description: ISO8601 string representing the end date of the poll.
 *       multiHash:
 *         type: string
 *         description: IPFS multihash of the poll markdown content.
 *       url:
 *         type: string
 *         format: url
 *         nullable: true
 *         description: URL to the raw poll content (e.g., GitHub markdown file).
 *       slug:
 *         type: string
 *         description: URL-friendly slug, often derived from multiHash.
 *       content:
 *         type: string
 *         description: HTML content of the poll description.
 *       summary:
 *         type: string
 *         nullable: true
 *         description: A brief summary of the poll.
 *       title:
 *         type: string
 *       options:
 *         type: object
 *         additionalProperties:
 *           type: string
 *         description: Key-value pairs of option index (string) to option text (string).
 *         example:
 *           "0": "Abstain"
 *           "1": "Yes"
 *           "2": "No"
 *       discussionLink:
 *         type: string
 *         format: url
 *         nullable: true
 *         description: Link to the forum discussion for the poll.
 *       voteType: # This seems to be a derived/simplified representation of parameters.inputFormat.type
 *         type: string
 *         enum: ['Plurality Voting', 'Ranked Choice IRV', 'Unknown'] # Added Unknown based on parsing logic
 *         description: Human-readable type of vote, derived from parameters.
 *       tags:
 *         type: array
 *         items:
 *           $ref: '#/definitions/PollTag'
 *       parameters:
 *         $ref: '#/definitions/PollParameters'
 *       ctx:
 *         type: object
 *         properties:
 *           prev:
 *             type: object
 *             nullable: true
 *             properties:
 *               slug: { type: string }
 *           next:
 *             type: object
 *             nullable: true
 *             properties:
 *               slug: { type: string }
 *         description: Context for previous and next polls, if available.
 *     example:
 *       pollId: 1
 *       creator: "0x123abc456def7890123abc456def7890123abc45"
 *       blockCreated: 123123
 *       startDate: "2021-11-08T16:00:00.000Z"
 *       endDate: "2021-11-15T16:00:00.000Z"
 *       multiHash: "Qme2ni4asyMj6Y1irnJVuaDaV4eWekJK2aT1GdjRd8yQ6L"
 *       url: "https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Ratification%20Poll.md"
 *       slug: "Qme2ni4a"
 *       content: "<h1>Poll Content</h1><p>Details about the poll...</p>"
 *       summary: "This is a summary of the poll."
 *       title: "Ratification Poll for MIP6c3-SP1"
 *       options:
 *         "0": "Abstain"
 *         "1": "Yes"
 *         "2": "No"
 *       discussionLink: "https://forum.makerdao.com/t/mip6c3-sp1"
 *       voteType: "Plurality Voting"
 *       tags:
 *         - id: "ratification-poll"
 *           shortname: "Ratification"
 *           longname: "Ratification Poll"
 *           description: "A poll to ratify a decision."
 *       parameters: {}
 *       ctx:
 *         prev: null
 *         next: { slug: "QmAbcDeF" }
 *
 * /api/polling/{poll-id-or-slug}:
 *   get:
 *     tags:
 *     - "polls"
 *     summary: Returns a specific poll detail by its ID or slug.
 *     description: Fetches detailed information for a single poll using either its numerical ID or its string slug.
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - name: poll-id-or-slug
 *         in: path
 *         description: The numerical ID or string slug of the poll.
 *         required: true
 *         schema:
 *           type: string # Handles both number (as string) and slug
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
 *         description: "Detailed information about the requested poll."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Poll'
 *       '400':
 *         description: "Bad request, e.g., missing poll ID or slug."
 *       '404':
 *         description: "Poll not found."
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<Poll>) => {
  // validate network
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const pollId = validateQueryParam(req.query['poll-id-or-slug'], 'number', {
    defaultValue: null
  }) as number | null;

  let pollSlug: string | null = null;

  if (!pollId) {
    pollSlug = validateQueryParam(req.query['poll-id-or-slug'], 'string', {
      defaultValue: null
    }) as string | null;
  }

  if (!pollId && !pollSlug) {
    throw new ApiError('You must pass a poll id or slug', 400, 'You must pass a poll id or slug');
  }

  const poll = await fetchSinglePoll(network, pollId || (pollSlug as number | string));

  if (!poll) {
    throw new ApiError('Poll not found', 404, 'Poll not found');
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(poll);
});
