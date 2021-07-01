import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { connectToDatabase } from '../../../_lib/utils';
import withApiHandler from '../../../_lib/withApiHandler';
import { config } from '../../../../../lib/config';
import { SupportedNetworks } from 'lib/constants';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const spellAddress: string = req.query.address as string;
    invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

    const { voterAddress, comment, commentSig, txHash, voterWeight } = JSON.parse(req.body);

    // only store comments for mainnet votes
    invariant(
      !req.query.network || req.query.network === SupportedNetworks.MAINNET,
      `unsupported network ${req.query.network}`
    );

    const provider = ethers.getDefaultProvider(SupportedNetworks.MAINNET, {
      infura: config.INFURA_KEY,
      alchemy: config.ALCHEMY_KEY
    });

    // verify tx
    const { from } = await provider.getTransaction(txHash);
    invariant(
      ethers.utils.getAddress(from) === ethers.utils.getAddress(voterAddress),
      "invalid 'from' address"
    );

    // verify signature
    invariant(
      ethers.utils.verifyMessage(comment, commentSig) === ethers.utils.getAddress(voterAddress),
      'invalid message signature'
    );

    // query db
    const { db, client } = await connectToDatabase();

    invariant(await client.isConnected(), 'Mongo client failed to connect');

    const collection = db.collection('executiveComments');
    await collection.insertOne({ spellAddress, voterAddress, comment, voterWeight, date: new Date() });

    res.status(200).json({ success: 'Added Successfully' });
  },
  { allowPost: true }
);
