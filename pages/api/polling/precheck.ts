import { NextApiRequest, NextApiResponse } from 'next';
import withApiHandler from 'modules/app/api/withApiHandler';
import { getRecentlyUsedGaslessVotingKey } from 'modules/cache/constants/cache-keys';
import { cacheGet } from 'modules/cache/cache';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { hasMkrRequiredVotingWeight } from 'modules/polling/helpers/hasMkrRequiredVotingWeight';
import { MIN_MKR_REQUIRED_FOR_GASLESS_VOTING } from 'modules/polling/polling.constants';
import { ballotIncludesAlreadyVoted } from 'modules/polling/helpers/ballotIncludesAlreadyVoted';
import { getRelayerBalance } from 'modules/polling/api/getRelayerBalance';

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const network = (req.query.network as SupportedNetworks) || DEFAULT_NETWORK.network;
  const voter = req.query.voter as string;
  const pollIds = req.query.pollIds as string;

  const pollIdsArray = pollIds.split(',');

  if (!voter) {
    return res.status(400).json({
      error: 'no voter provided'
    });
  }

  if (!pollIds || pollIdsArray.length === 0) {
    return res.status(400).json({
      error: 'no poll ids provided'
    });
  }

  const cacheKey = getRecentlyUsedGaslessVotingKey(voter);

  // TODO add a check to see if user has already voted in polls?
  const [recentlyUsedGaslessVoting, hasMkrRequired, alreadyVoted, relayBalance] = await Promise.all([
    cacheGet(cacheKey, network),
    hasMkrRequiredVotingWeight(voter, network, MIN_MKR_REQUIRED_FOR_GASLESS_VOTING),
    ballotIncludesAlreadyVoted(voter, network, pollIdsArray),
    getRelayerBalance(network)
  ]);

  return res.status(200).json({
    recentlyUsedGaslessVoting,
    hasMkrRequired,
    alreadyVoted,
    relayBalance
  });
});
