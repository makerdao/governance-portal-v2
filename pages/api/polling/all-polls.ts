import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';
import { isSupportedNetwork } from 'lib/maker';
import { DEFAULT_NETWORK } from 'lib/constants';
import withApiHandler from 'lib/api/withApiHandler';
import { getPolls } from 'modules/polling/api/fetchPolls';

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
 *   Poll:
 *     type: object
 *     properties:
 *       pollId:
 *         type: integer
 *       creator:
 *         type: string
 *       blockCreated:
 *         type: number
 *       startDate:
 *         type: string
 *       endDate:
 *         type: string
 *       multiHash:
 *         type: string
 *       url:
 *         type: string
 *       slug:
 *         type: string
 *       content:
 *         type: string
 *       summary:
 *         type: string
 *       title:
 *         type: string
 *       options:
 *         type: object
 *       discussionLink:
 *         type: string
 *       voteType:
 *         type: string
 *         enum: ['Plurality Voting', 'Ranked Choice IRV']
 *       categories:
 *         type: array
 *       ctx:
 *         type: object
 *     example:
 *       - pollId: 1
 *         creator: '0x123123'
 *         blockCreated: 123123
 *         startDate: "2021-11-08T16:00:00.000Z"
 *         endDate: "2021-11-08T16:00:00.000Z"
 *         multiHash: 'Qme2ni4asyMj6Y1irnJVuaDaV4eWekJK2aT1GdjRd8yQ6L'
 *         url: 'https://raw.githubusercontent.com/makerdao/community/master/governance/polls/Ratification%20Poll%20for%20Supplement%20to%20Collateral%20Onboarding%20Application%20(MIP6c3-SP1)%20-%20November%208%2C%202021.md'
 *         slug: 'Qme2ni4a'
 *         content: 'ABC'
 *         summary: 'abc'
 *         title: 'abc'
 *         options:
 *           0: 'Abstain'
 *           1: 'Yes'
 *           2: 'No'
 *         discussionLink: 'https://forum.makerdao.com'
 *         voteType: 'Plurality Voting'
 *         categories: ['Greenlight']
 *         ctx:
 *           prev: null
 *           next: null
 *
 * /api/polling/all-polls:
 *   get:
 *     tags:
 *     - "polls"
 *     description: Returns all polls
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "categories"
 *       in: "query"
 *       description: "Categories to filter polls by. Example 'Collateral', 'Greenlight'"
 *       required: false
 *       type: "array"
 *       items:
 *         type: "string"
 *         enum:
 *         - "Collateral"
 *         - "Greenlight"
 *         - "Governance"
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
  const network = (req.query.network as string) || DEFAULT_NETWORK;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);

  const filters = {
    startDate: req.query.startDate ? new Date(req.query.startDate as string) : null,
    endDate: req.query.endDate ? new Date(req.query.endDate as string) : null,
    categories: req.query.categories
      ? typeof req.query.categories === 'string'
        ? [req.query.categories]
        : req.query.categories
      : null
  };

  const pollsResponse = await getPolls(filters, network);

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(pollsResponse);
});
