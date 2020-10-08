import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { connectToDatabase } from '../../../_lib/utils';
import withApiHandler from '../../../_lib/withApiHandler';
import { SupportedNetworks } from '../../../../../lib/constants';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const spellAddress: string = req.query.address as string;
    invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

    const { voterAddress, comment } = JSON.parse(req.body);

    // only store comments for mainnet
    invariant(
      !req.query.network || req.query.network === SupportedNetworks.MAINNET,
      `unsupported network ${req.query.network}`
    );

    const { db, client } = await connectToDatabase();

    invariant(await client.isConnected(), 'Mongo client failed to connect');

    const collection = db.collection('executiveComments');
    await collection.insert({ spellAddress, voterAddress, comment });

    res.status(200);
  },
  { allowPost: true }
);
