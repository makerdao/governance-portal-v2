import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { connectToDatabase } from '../../../_lib/utils';
import withApiHandler from '../../../_lib/withApiHandler';
import { SupportedNetworks } from '../../../../../lib/constants';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const spellAddress: string = req.query.address as string;
  invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

  // only list comments for mainnet
  invariant(
    !req.query.network || req.query.network === SupportedNetworks.MAINNET,
    `unsupported network ${req.query.network}`
  );

  const { db, client } = await connectToDatabase();

  invariant(await client.isConnected(), 'mongo client failed to connect');

  const collection = db.collection('executiveComments');
  const comments = await collection.find({ spellAddress }).sort({ date: -1 }).toArray();
  comments.forEach(comment => {
    delete comment._id;
  });

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
  res.status(200).json(comments);
});
