import invariant from 'tiny-invariant';
import { ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';

import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { ExecutiveComment, ExecutiveCommentsRequestBody } from 'modules/comments/types/executiveComment';
import withApiHandler from 'modules/app/api/withApiHandler';
import { connectToDatabase } from 'modules/db/helpers/connectToDatabase';
import { getDefaultProvider } from 'modules/web3/helpers/getDefaultProvider';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const spellAddress: string = req.query.address as string;
    invariant(spellAddress && ethers.utils.isAddress(spellAddress), 'valid spell address required');

    const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;

    invariant(network && network.length > 0, 'Network not supported');

    const {
      voterAddress,
      comment,
      signedMessage,
      txHash,
      voterWeight,
      delegateAddress,
      voteProxyAddress
    }: ExecutiveCommentsRequestBody = JSON.parse(req.body);

    const provider = getDefaultProvider(network);

    // verify tx
    const { from } = await provider.getTransaction(txHash);
    invariant(
      ethers.utils.getAddress(from) === ethers.utils.getAddress(voterAddress),
      "invalid 'from' address"
    );

    // verify signature
    invariant(
      ethers.utils.verifyMessage(comment, signedMessage) === ethers.utils.getAddress(voterAddress),
      'invalid message signature'
    );

    // query db
    const { db, client } = await connectToDatabase();

    invariant(await client.isConnected(), 'Mongo client failed to connect');

    const collection = db.collection('executiveComments');

    const newComment: ExecutiveComment = {
      spellAddress,
      voterAddress,
      delegateAddress,
      comment,
      voterWeight,
      voteProxyAddress: voteProxyAddress || '',
      date: new Date(),
      network,
      txHash
    };

    await collection.insertOne(newComment);

    res.status(200).json({ success: 'Added Successfully' });
  },
  { allowPost: true }
);
