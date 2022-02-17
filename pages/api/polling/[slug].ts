import withApiHandler from 'modules/app/api/withApiHandler';
import { fetchPollBySlug } from 'modules/polling/api/fetchPollBy';
import { DEFAULT_NETWORK } from 'modules/web3/constants/networks';
import { isSupportedNetwork } from 'modules/web3/helpers/networks';
import { NextApiRequest, NextApiResponse } from 'next';
import invariant from 'tiny-invariant';

/**
 * @swagger
 * definitions:
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
 * /api/polling/{slug}:
 *   get:
 *     tags:
 *     - "polls"
 *     description: Returns a poll detail
 *     produces:
 *     - "application/json"
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Slug of the poll
 *     responses:
 *       '200':
 *         description: "Poll Detail"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Poll'
 */
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as string) || DEFAULT_NETWORK.network;
  invariant(isSupportedNetwork(network), `unsupported network ${network}`);
  const slug = req.query.slug as string;

  const poll = await fetchPollBySlug(slug, network);

  if (!poll) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(poll);
});
