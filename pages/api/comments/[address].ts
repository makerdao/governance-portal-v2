import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { CommentsAPIResponseItem } from 'modules/comments/types/comments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getCommentsByAddress } from 'modules/comments/api/getCommentsByAddress';

export default withApiHandler(
  async (
    req: NextApiRequest,
    res: NextApiResponse<{
      comments: CommentsAPIResponseItem[];
    }>
  ) => {
    const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;
    const address = req.query.address as string;
    const response = await getCommentsByAddress(address, network);
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    res.status(200).json(response);
  }
);
