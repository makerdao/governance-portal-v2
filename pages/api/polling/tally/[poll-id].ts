import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'lib/api/withApiHandler';
import { SupportedNetworks } from 'lib/constants';
import { getPollTally } from 'modules/polling/helpers/getPollTaly';
import { getPollById } from 'modules/polling/api/fetchPolls';
import { DEFAULT_NETWORK } from 'modules/web3/web3.constants';

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
 *       rankedChoiceOption:
 *         type: array
 *         items:
 *           type: integer
 *     example:
 *       - voter: "0xcfeed3fbefe9eb09b37539eaa0ddd58d1e1044ca"
 *         optionId: 1
 *         optionIdRaw: "1"
 *         mkrSupport: "23232.23132"
 *         rankedChoiceOption: [1]
 *   ResultTally:
 *     type: object
 *     properties:
 *       optionName:
 *         type: string
 *       optionId:
 *         type: string
 *       firstPct:
 *         type: string
 *       firstChoice:
 *         type: string
 *       mkrSupport:
 *         type: string
 *       winner:
 *         type: boolean
 *       eliminated:
 *         type: boolean
 *     example:
 *       - optionId: "1"
 *         optionName: "Yes"
 *         firstChoice: "213123.21312"
 *         transfer: "0"
 *         mkrSupport: "23232.23132"
 *         firstPct: "12.222"
 *         winner: true
 *         eliminated: false
 *   Tally:
 *     type: object
 *     properties:
 *       pollVoteType:
 *         type: string
 *         enum: ['Plurality Voting', 'Ranked Choice IRV']
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
 *       - pollVoteType: "Ranked Choice IRV"
 *         winner: '2'
 *         totalMkrParticipation: 12312.213213
 *         numVoters: 8
 *         rounds: 1
 *         winningOptionName: '30% of Real AAVEv2 DAI Supply'
 *         votesByAddress:
 *           - voter: "0xcfeed3fbefe9eb09b37539eaa0ddd58d1e1044ca"
 *             optionId: 1
 *             optionIdRaw: "1"
 *             mkrSupport: "23232.23132"
 *             rankedChoiceOption: [1]
 *         results:
 *           - optionId: "1"
 *             optionName: "Yes"
 *             firstChoice: "213123.21312"
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
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK;

  const poll = await getPollById(parseInt(req.query['poll-id'] as string, 10), network);
  const tally = await getPollTally(poll, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(tally);
});
