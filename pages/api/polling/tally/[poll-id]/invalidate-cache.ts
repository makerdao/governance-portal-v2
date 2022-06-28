import { NextApiRequest, NextApiResponse } from 'next';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import withApiHandler from 'modules/app/api/withApiHandler';
import { deleteCachedPollTally } from 'modules/polling/helpers/getPollTally';
import logger from 'lib/logger';

// Deletes cache for a tally
export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;

  const pollId = parseInt(req.query['poll-id'] as string, 10);
  try {
    deleteCachedPollTally(pollId, network);

    return res.status(200).json({
      invalidated: true,
      pollId
    });
  } catch (e) {
    logger.error(`invalidate-cache: ${e.message}`);
    return res.status(200).json({
      invalidated: false,
      pollId
    });
  }
});
