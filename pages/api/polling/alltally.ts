import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { getPolls } from 'modules/polling/api/fetchPolls';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { fetchPollTally } from 'modules/polling/api/fetchPollTally';

/**
 * @swagger
 * definitions:
 *   ArrayOfPolls:
 *     type: array
 *     items:
 *       $ref: '#/definitions/Poll'
 *   PollStats:
 *     type: object
 *     properties:
 *       active:
 *         type: integer
 *       finished:
 *         type: integer
 *       total:
 *         type: integer
 *     example:
 *       - active: 10
 *         finished: 10
 *         total: 10
 *
 * /api/polling/all-polls:
 *   get:
 *     tags:
 *     - "polls"
 *     description: Returns all polls
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "tags"
 *       in: "query"
 *       description: "tags to filter polls by. Example 'collateral', 'greenlight'"
 *       required: false
 *       type: "array"
 *       items:
 *         type: "string"
 *         enum:
 *         - "collateral"
 *         - "greenlight"
 *         - "governance"
 *         default: ""
 *       collectionFormat: "multi"
 *     responses:
 *       '200':
 *         description: "List of polls"
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 polls:
 *                   $ref: '#/definitions/ArrayOfPolls'
 *                 stats:
 *                   $ref: '#/definitions/PollStats'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const filters = {
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : null,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : null,
    tags: req.query.tags ? (typeof req.query.tags === 'string' ? [req.query.tags] : req.query.tags) : null
  };

  const pollsResponse = await getPolls(filters, network);

  const tallies = []
  const results = await (Promise.all(pollsResponse.polls.map(async(poll ) =>  {
    try {
        const tally = await fetchPollTally(poll, network);
        return tally 
    } catch (e) {
        return {
            pollId: poll.pollId,
            error: 'Error fetching tally'
        }
    }

    return tally
  })))

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(results);
});
