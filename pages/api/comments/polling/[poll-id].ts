import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'lib/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'lib/constants';
import { PollCommentsAPIResponseItem } from 'modules/comments/types/comments';
import { getPollComments } from 'modules/comments/api/getPollComments';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse<PollCommentsAPIResponseItem[]>) => {
    const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK;

    const pollId = parseInt(req.query['poll-id'] as string, 10);

    const response = await getPollComments(pollId, network);

    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    // only return the latest comment from each address
    res.status(200).json(response);
  }
);
