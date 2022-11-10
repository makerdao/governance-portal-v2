import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { PollComment, PollsCommentsRequestBody } from 'modules/comments/types/comments';
import withApiHandler from 'modules/app/api/withApiHandler';
import { verifyCommentParameters } from 'modules/comments/api/verifyCommentParameters';
import { insertPollComments } from 'modules/comments/api/insertPollingComments';
import logger from 'lib/logger';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { getGaslessNetwork } from 'modules/web3/helpers/chain';
import { ApiError } from 'modules/app/api/ApiError';
import { API_ERROR_CODES } from 'modules/app/constants/apiErrors';

export default withApiHandler(
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const body = req.body as PollsCommentsRequestBody;

      if (!req.query.network || !body.txHash || !body.comments || !body.voterAddress || !body.hotAddress) {
        throw new Error('Unsupported parameters');
      }

      const network = validateQueryParam(req.query.network, 'string', {
        defaultValue: DEFAULT_NETWORK.network,
        validValues: [SupportedNetworks.GOERLI, SupportedNetworks.GOERLIFORK, SupportedNetworks.MAINNET]
      }) as SupportedNetworks;

      const gaslessNetwork = validateQueryParam(req.query.gasless, 'string', {
        defaultValue: '',
        validValues: [SupportedNetworks.ARBITRUM, SupportedNetworks.ARBITRUMTESTNET]
      }) as SupportedNetworks;

      // Verify that gaslesNetwork and network match
      const gaslessNetworkMatches = gaslessNetwork && getGaslessNetwork(network) === gaslessNetwork;

      if (gaslessNetwork && !gaslessNetworkMatches) {
        throw new ApiError('Invalid Gasless Network', 400, 'Invalid Gasless Network');
      }

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

      const commentsToInsert: PollComment[] = body.comments.map(
        (comment): PollComment => ({
          pollId: comment.pollId as number,
          comment: comment.comment as string,
          hotAddress: body.hotAddress?.toLowerCase() || '',
          accountType: resultVerify,
          commentType: 'poll',
          network,
          gaslessNetwork,
          date: new Date(),
          voterAddress: body.voterAddress.toLowerCase(),
          txHash: body.txHash
        })
      );

      await insertPollComments(commentsToInsert);

      res.status(200).json({ success: 'Added Successfully' });
    } catch (err) {
      throw new ApiError(`POST /api/comments/polling/add: ${err}`, 500, 'Error adding poll comments');
    }
  },
  { allowPost: true }
);
