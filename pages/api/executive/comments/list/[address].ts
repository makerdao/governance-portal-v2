import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import uniqBy from 'lodash/uniqBy';

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
  // decending sort
  const comments = await collection.find({ spellAddress }).sort({ date: -1 }).toArray();

  comments.forEach(comment => {
    delete comment._id;
  });

  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  // only return the latest comment from each address
  res.status(200).json(uniqBy(comments, 'voterAddress'));
});
