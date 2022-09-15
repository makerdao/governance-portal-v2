import { NextApiRequest, NextApiResponse } from 'next';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/comments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { verifyCommentParameters } from 'modules/comments/api/verifyCommentParameters';
import { insertPollComments } from 'modules/comments/api/insertPollingComments';
import logger from 'lib/logger';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const body = req.body as PollsCommentsRequestBody;

      if (!req.query.network || !body.txHash || !body.comments || !body.voterAddress || !body.hotAddress) {
        throw new Error('Unsupported parameters');
      }

      // TODO: Read gasless network parameter and insert that in the comment correctly / matching the right network
      // TODO: Validate network and gasless network parameters using new validation method
      const gaslessNetwork = req.query.gasless ? (req.query.gasless as SupportedNetworks) : null;
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

      //if L2 vote, store the L2 network as the network
      const txNetwork = gaslessNetwork ?? network;

      const commentsToInsert: PollComment[] = body.comments.map(comment => ({
        pollId: comment.pollId as number,
        comment: comment.comment as string,
        hotAddress: body.hotAddress?.toLowerCase() || '',
        accountType: resultVerify,
        commentType: 'poll',
        network: txNetwork,
        date: new Date(),
        voterAddress: body.voterAddress.toLowerCase(),
        txHash: body.txHash
      }));

      await insertPollComments(commentsToInsert);

      res.status(200).json({ success: 'Added Successfully' });
    } catch (err) {
      logger.error(`POST /api/comments/polling/add: ${err}`);
      return res.status(500).json({});
    }
  },
  { allowPost: true }
);
