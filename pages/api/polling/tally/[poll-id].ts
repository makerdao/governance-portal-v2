/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getPollTally } from 'modules/polling/helpers/getPollTally';
import { fetchSinglePoll } from 'modules/polling/api/fetchPollBy';
import { pollHasStarted } from 'modules/polling/helpers/utils';
import { PollTally } from 'modules/polling/types';
import { ApiError } from 'modules/app/api/ApiError';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { getPollTallyCacheKey } from 'modules/cache/constants/cache-keys';
import { cacheGet } from 'modules/cache/cache';
import { ONE_WEEK_IN_MS, ONE_MINUTE_IN_MS } from 'modules/app/constants/time';

// Returns a PollTally given a pollID

/**
 * @swagger
 * definitions:
 *   PollParametersInputFormat: # Based on [poll-id-or-slug].ts
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *         description: The input format type (e.g., singleChoice, rankFree).
 *         enum: [singleChoice, rankFree, chooseFree, majority]
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
 *   PollParametersVictoryCondition: # Based on [poll-id-or-slug].ts
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *         description: Type of victory condition (e.g., plurality, majority, instantRunoff).
 *       percent:
 *         type: number
 *         format: float
 *         nullable: true
 *         description: Percentage required for majority (if type is majority).
 *   PollParameters: # Based on [poll-id-or-slug].ts
 *     type: object
 *     properties:
 *       inputFormat:
 *         $ref: '#/definitions/PollParametersInputFormat'
 *       victoryConditions:
 *         type: array
 *         items:
 *           $ref: '#/definitions/PollParametersVictoryCondition'
 *         description: Conditions that determine the outcome of the poll.
 *       resultDisplay:
 *         type: string
 *         description: How the poll results should be displayed.
 *   PollTallyVote: # Corresponds to PollTallyVote type
 *     type: object
 *     properties:
 *       pollId:
 *         type: integer
 *         description: Identifier of the poll this vote belongs to.
 *       voter:
 *         type: string
 *         format: address
 *         description: Address of the voter.
 *       ballot:
 *         type: array
 *         items:
 *           type: integer
 *         description: Array of chosen option indices by the voter.
 *       mkrSupport:
 *         type: string # Represents number | string, string is safer for large numbers
 *         description: MKR voting weight associated with this vote.
 *       chainId:
 *         type: integer
 *         description: Chain ID where the vote was cast.
 *       blockTimestamp:
 *         type: number # Unix timestamp
 *         description: Timestamp of the block when the vote was cast (Unix timestamp).
 *       hash:
 *         type: string
 *         description: Transaction hash of the vote.
 *     example:
 *       pollId: 123
 *       voter: "0xcfeed3fbefe9eb09b37539eaa0ddd58d1e1044ca"
 *       ballot: [1]
 *       mkrSupport: "23232.23132"
 *       chainId: 1
 *       blockTimestamp: 1678886400
 *       hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
 *   PollTallyOption: # Corresponds to PollTallyOption type
 *     type: object
 *     properties:
 *       optionId:
 *         type: string # Or number, depending on Poll.options key type
 *         description: Identifier of the poll option.
 *       optionName:
 *         type: string
 *         description: Textual name of the poll option.
 *       mkrSupport:
 *         type: string # Represents number | string
 *         description: Total MKR support for this option in the current state/round.
 *       firstPct:
 *         type: string
 *         nullable: true
 *         description: Percentage of first-preference votes (e.g., in IRV first round).
 *       transferPct:
 *         type: number # Should be string if it represents percentage as "xx.xx%"
 *         format: float
 *         nullable: true
 *         description: Percentage of votes transferred to this option in a round.
 *       transfer:
 *         type: number # Should be string if it's a large number formatted
 *         format: float
 *         nullable: true
 *         description: Amount of MKR/votes transferred to this option in a round.
 *       winner:
 *         type: boolean
 *         nullable: true
 *         description: Whether this option is currently considered a winner.
 *       eliminated:
 *         type: boolean
 *         nullable: true
 *         description: Whether this option has been eliminated in a voting round.
 *     example:
 *       optionId: "1"
 *       optionName: "Yes"
 *       mkrSupport: "23232.23132"
 *       firstPct: "12.22"
 *       transferPct: 0.02
 *       transfer: 500.5
 *       winner: true
 *       eliminated: false
 *   PollTallyResponse: # Corresponds to PollTally type
 *     type: object
 *     properties:
 *       parameters:
 *         $ref: '#/definitions/PollParameters'
 *       winner:
 *         type: integer
 *         nullable: true
 *         description: The index of the winning option, if determined.
 *       numVoters:
 *         type: integer
 *         description: Total number of unique voters.
 *       results:
 *         type: array
 *         items:
 *           $ref: '#/definitions/PollTallyOption'
 *         description: Array of tally results for each option.
 *       totalMkrParticipation:
 *         type: string # Represents number | string
 *         description: Total MKR that participated in the poll.
 *       totalMkrActiveParticipation:
 *         type: string # Represents number | string
 *         description: Total active MKR participation (may differ based on poll mechanics).
 *       winningOptionName:
 *         type: string
 *         nullable: true # Can be empty if no winner yet or not applicable
 *         description: Name of the winning option.
 *       victoryConditionMatched:
 *         type: integer # Or boolean, depending on actual values. Assuming number based on TS
 *         nullable: true
 *         description: Indicates if/which victory condition was met.
 *       votesByAddress:
 *         type: array
 *         items:
 *           $ref: '#/definitions/PollTallyVote'
 *         nullable: true
 *         description: Optional detailed list of votes by address.
 *       rounds:
 *         type: integer
 *         nullable: true
 *         description: Number of rounds conducted (e.g., in IRV polls).
 *     example:
 *       parameters: {}
 *       winner: 1
 *       numVoters: 8
 *       results: [
 *         {
 *           optionId: "1",
 *           optionName: "Yes",
 *           mkrSupport: "23232.23132",
 *           winner: true
 *         }
 *       ]
 *       totalMkrParticipation: "123123.213213"
 *       totalMkrActiveParticipation: "120000.000000"
 *       winningOptionName: "Yes"
 *       victoryConditionMatched: 1
 *       votesByAddress: []
 *       rounds: 1
 *
 * /api/polling/tally/{poll-id}:
 *   get:
 *     tags:
 *     - "polling"
 *     summary: Returns the tally for a specific poll.
 *     description: Fetches the current vote tally, participation metrics, and results for a given poll ID.
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - name: poll-id
 *         in: path
 *         description: The numerical ID of the poll.
 *         required: true
 *         schema:
 *           type: integer
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
 *         description: "Detailed tally of the poll."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/PollTallyResponse'
 *       '400':
 *         description: "Bad request (e.g., invalid poll ID or network)."
 *       '404':
 *         description: "Poll not found."
 */
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

  // validate pollId
  const pollId = validateQueryParam(
    req.query['poll-id'],
    'number',
    {
      defaultValue: null,
      minValue: 0
    },
    n => !!n,
    new ApiError('Invalid poll id', 400, 'Invalid poll id')
  ) as number;

  let tally: PollTally;

  const cacheKey = getPollTallyCacheKey(pollId);
  const cachedTally =
    (await cacheGet(cacheKey, network, ONE_WEEK_IN_MS)) ||
    (await cacheGet(cacheKey, network, ONE_MINUTE_IN_MS));

  if (cachedTally) {
    tally = JSON.parse(cachedTally);
  } else {
    const poll = await fetchSinglePoll(network, pollId);

    if (!poll) {
      throw new ApiError('Poll not found', 404, 'Poll not found');
    }

    if (!pollHasStarted(poll)) {
      const emptyTally: PollTally = {
        parameters: poll.parameters,
        numVoters: 0,
        results: [],
        totalMkrParticipation: 0,
        totalMkrActiveParticipation: 0,
        victoryConditionMatched: null,
        winner: null,
        winningOptionName: '',
        votesByAddress: []
      };

      return res.status(200).json(emptyTally);
    }
    tally = await getPollTally(poll, network);
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  return res.status(200).json(tally);
});
