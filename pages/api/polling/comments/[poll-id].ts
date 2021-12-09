import invariant from 'tiny-invariant';
import { NextApiRequest, NextApiResponse } from 'next';

import { connectToDatabase } from 'lib/api/utils';
import withApiHandler from 'lib/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'lib/constants';
import { PollComment } from 'modules/polling/types/pollComments';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<PollComment[]>) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK;

  const pollId = parseInt(req.query['poll-id'] as string, 10);

  const { db, client } = await connectToDatabase();

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('pollingComments');
  // decending sort
  const comments = await collection.find({ pollId, network }).sort({ date: -1 }).toArray();

  comments.forEach(comment => {
    delete comment._id;
  });

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  // only return the latest comment from each address
  res.status(200).json(comments);
});
