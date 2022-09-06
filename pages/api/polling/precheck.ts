import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getRecentlyUsedGaslessVotingKey } from 'modules/cache/constants/cache-keys';
import { cacheGet } from 'modules/cache/cache';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { hasMkrRequiredVotingWeight } from 'modules/polling/helpers/hasMkrRequiredVotingWeight';
import { MIN_MKR_REQUIRED_FOR_GASLESS_VOTING } from 'modules/polling/polling.constants';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;
  const voter = req.query.voter as string;

  if (!voter) {
    return res.status(400).json({
      error: 'no voter provided'
    });
  }
  const cacheKey = getRecentlyUsedGaslessVotingKey(voter);

  // TODO add a check to see if user has already voted in polls?
  const [recentlyUsedGaslessVoting, hasMkrRequired] = await Promise.all([
    cacheGet(cacheKey, network),
    hasMkrRequiredVotingWeight(voter, network, MIN_MKR_REQUIRED_FOR_GASLESS_VOTING)
  ]);

  return res.status(200).json({
    recentlyUsedGaslessVoting,
    hasMkrRequired
  });
});
