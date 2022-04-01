import { NextApiRequest, NextApiResponse } from 'next';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/comments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { verifyCommentParameters } from 'modules/comments/api/verifyCommentParameters';
import { insertPollComments } from 'modules/comments/api/insertPollingComments';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const body = req.body as PollsCommentsRequestBody;

    if (!req.query.network || !body.txHash || !body.comments || !body.voterAddress || !body.hotAddress) {
      throw new Error('Unsupported parameters');
    }

    const network = req.query.network as SupportedNetworks;

    // Verifies the data
    const resultVerify = await verifyCommentParameters(
      body.hotAddress,
      body.voterAddress,
      body.signedMessage,
      body.txHash,
      network
    );

    // TODO: check that the transaction is from a real polling contract
    // console.log(transaction);

    const commentsToInsert: PollComment[] = body.comments.map(comment => ({
      pollId: comment.pollId as number,
      comment: comment.comment as string,
      hotAddress: body.hotAddress?.toLowerCase() || '',
      accountType: resultVerify,
      commentType: 'poll',
      network,
      date: new Date(),
      voterAddress: body.voterAddress.toLowerCase(),
      txHash: body.txHash
    }));

    await insertPollComments(commentsToInsert);

    res.status(200).json({ success: 'Added Successfully' });
  },
  { allowPost: true }
);
