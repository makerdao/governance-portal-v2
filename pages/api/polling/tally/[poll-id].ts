import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getPollTally } from 'modules/polling/helpers/getPollTally';
import { fetchPollById } from 'modules/polling/api/fetchPollBy';
import { pollHasStarted } from 'modules/polling/helpers/utils';
import { PollTally } from 'modules/polling/types';
import { ApiError } from 'modules/app/api/ApiError';

// Returns a PollTally given a pollID

/**
 * @swagger
 * definitions:
 *   VoteByAddress:
 *     type: object
 *     properties:
 *       voter:
 *         type: string
 *       optionId:
 *         type: integer
 *       optionIdRaw:
 *         type: string
 *       mkrSupport:
 *         type: string
 *       ballot:
 *         type: array
 *         items:
 *           type: integer
 *     example:
 *       - voter: "0xcfeed3fbefe9eb09b37539eaa0ddd58d1e1044ca"
 *         optionId: 1
 *         optionIdRaw: "1"
 *         mkrSupport: "23232.23132"
 *         ballot: [1]
 *   ResultTally:
 *     type: object
 *     properties:
 *       optionName:
 *         type: string
 *       optionId:
 *         type: string
 *       firstPct:
 *         type: string
 *       transfer:
 *         type: number
 *       transferPct:
 *         type: number
 *       mkrSupport:
 *         type: string
 *       winner:
 *         type: boolean
 *       eliminated:
 *         type: boolean
 *     example:
 *       - optionId: "1"
 *         optionName: "Yes"
 *         transferPct: 2
 *         transfer: "0"
 *         mkrSupport: "23232.23132"
 *         firstPct: "12.222"
 *         winner: true
 *         eliminated: false
 *   Tally:
 *     type: object
 *     properties:
 *       totalMkrParticipation:
 *         type: number
 *       winner:
 *         type: string
 *       numVoters:
 *         type: number
 *       winningOptionName:
 *         type: string;
 *       votesByAddress:
 *         type: array
 *         items:
 *           $ref: '#/definitions/VoteByAddress'
 *       results:
 *         type: array
 *         items:
 *           $ref: '#/definitions/ResultTally'
 *     example:
 *       - winner: '2'
 *         totalMkrParticipation: 12312.213213
 *         numVoters: 8
 *         rounds: 1
 *         winningOptionName: '30% of Real AAVEv2 DAI Supply'
 *         votesByAddress:
 *           - voter: "0xcfeed3fbefe9eb09b37539eaa0ddd58d1e1044ca"
 *             mkrSupport: "23232.23132"
 *             ballot: [1]
 *         results:
 *           - optionId: "1"
 *             optionName: "Yes"
 *             transfer: "0"
 *             mkrSupport: "23232.23132"
 *             firstPct: "12.222"
 *             winner: true
 *             eliminated: false
 *
 * /api/polling/tally/{pollId}:
 *   get:
 *     tags:
 *     - "tally"
 *     description: Returns a poll tally
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: pollId
 *         schema:
 *           type: number
 *         required: true
 *         description: Poll Id
 *     responses:
 *       '200':
 *         description: "Tally of a poll"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Tally'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;
  const poll = await fetchPollById(parseInt(req.query['poll-id'] as string, 10), network);

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
  const tally = await getPollTally(poll, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  return res.status(200).json(tally);
});
