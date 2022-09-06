import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getRecentlyUsedGaslessVotingKey } from 'modules/cache/constants/cache-keys';
import { cacheGet } from 'modules/cache/cache';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { hasMkrRequiredForGaslessVotingCheck } from 'modules/polling/helpers/hasMkrRequiredForGaslessVotingCheck';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;
  const voter = req.query.voter as string;

  if (!voter) {
    return res.status(400).json({
      error: 'no voter provided'
    });
  }
  const cacheKey = getRecentlyUsedGaslessVotingKey(voter);

  const [recentlyUsedGaslessVoting, hasMkrRequired] = await Promise.all([
    cacheGet(cacheKey, network),
    hasMkrRequiredForGaslessVotingCheck(voter, network)
  ]);

  return res.status(200).json({
    recentlyUsedGaslessVoting,
    hasMkrRequired
  });
});
