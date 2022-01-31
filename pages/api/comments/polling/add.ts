import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { connectToDatabase } from 'modules/db/helpers/connectToDatabase';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/pollComments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getDefaultProvider } from 'modules/web3/helpers/getDefaultProvider';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const body = JSON.parse(req.body) as PollsCommentsRequestBody;

    if (!req.query.network || !body.txHash || !body.comments || !body.voterAddress) {
      throw new Error('Unsupported parameters');
    }

    const network = req.query.network as SupportedNetworks;

    invariant(network && network.length > 0, 'Network not supported');

    const provider = getDefaultProvider(network);

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
    const commentsToInsert: PollComment[] = body.comments.map(comment => ({
      pollId: comment.pollId as number,
      comment: comment.comment as string,
      network,
      date: new Date(),
      voterAddress: body.voterAddress,
      voteProxyAddress: body.voteProxyAddress || '',
      delegateAddress: body.delegateAddress || '',
      txHash: body.txHash
    }));

    try {
      await collection.insertMany(commentsToInsert);
    } catch (e) {
      console.error(
        `A MongoBulkWriteException occurred, but there are ${e.result.result.nInserted} successfully processed documents.`
      );
    }

    res.status(200).json({ success: 'Added Successfully' });
  },
  { allowPost: true }
);
