import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { connectToDatabase } from 'lib/api/utils';
import withApiHandler from 'lib/api/withApiHandler';
import { config } from 'lib/config';
import { SupportedNetworks } from 'modules/web3/web3.constants';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/pollComments';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const body = JSON.parse(req.body) as PollsCommentsRequestBody;

    if (!req.query.network || !body.txHash || !body.comments || !body.voterAddress) {
      throw new Error('Unsupported parameters');
    }

    const network = req.query.network as SupportedNetworks;

    invariant(network && network.length > 0, 'Network not supported');

    const provider = ethers.getDefaultProvider(network, {
      infura: config.INFURA_KEY,
      alchemy: config.ALCHEMY_KEY
    });

    // verify tx
    const transaction = await provider.getTransaction(body.txHash);
    invariant(
      ethers.utils.getAddress(transaction.from) === ethers.utils.getAddress(body.voterAddress),
      "invalid 'from' address"
    );

    // verify signature
    invariant(
      ethers.utils.verifyMessage(body.rawMessage, body.signedMessage) ===
        ethers.utils.getAddress(body.voterAddress),
      'invalid message signature'
    );

    // TODO: check that the transaction is from a real polling contract
    console.log(transaction);

    // query db
    const { db, client } = await connectToDatabase();

    invariant(await client.isConnected(), 'Mongo client failed to connect');

    const collection = db.collection('pollingComments');
    body.comments.forEach(async comment => {
      const commentToInsert: PollComment = {
        pollId: comment.pollId as number,
        comment: comment.comment as string,
        network,
        date: new Date(),
        voterAddress: body.voterAddress,
        voteProxyAddress: body.voteProxyAddress || '',
        delegateAddress: body.delegateAddress || '',
        txHash: body.txHash
      };
      await collection.insertOne(commentToInsert);
    });

    res.status(200).json({ success: 'Added Successfully' });
  },
  { allowPost: true }
);
