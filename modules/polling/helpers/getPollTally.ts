import { SupportedNetworks } from 'modules/web3/constants/networks';
import { backoffRetry } from 'lib/utils';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { fetchPollTally } from 'modules/polling/api/fetchPollTally';
import { fetchVotesByAddressForPoll } from 'modules/polling/api/fetchVotesByAddress';
import { Poll, PollTally } from 'modules/polling/types';
import { pollHasEnded } from './utils';
import { getPollTallyCacheKey } from 'modules/cache/constants/cache-keys';
import { THIRTY_SECONDS_IN_MS, ONE_DAY_IN_MS } from 'modules/app/constants/time';

export async function getPollTally(poll: Poll, network: SupportedNetworks): Promise<PollTally> {
  // const cacheKey = getPollTallyCacheKey(poll.pollId);
  // const cachedTally = await cacheGet(cacheKey, network);
  // if (cachedTally) {
  //   return JSON.parse(cachedTally);
  // }

  // Builds poll tally
  const tally: PollTally = await backoffRetry(3, () => fetchPollTally(poll, network));

  const endUnix = new Date(poll.endDate).getTime() / 1000;
  const votesByAddress = await fetchVotesByAddressForPoll(poll.pollId, endUnix, network);

  const tallyObject = {
    ...tally,
    votesByAddress
  };

  const pollEnded = pollHasEnded(poll);

  // cacheSet(cacheKey, JSON.stringify(tallyObject), network, pollEnded ? ONE_DAY_IN_MS : THIRTY_SECONDS_IN_MS);

  return tallyObject;
}
