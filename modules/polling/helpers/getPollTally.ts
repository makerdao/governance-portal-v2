import { SupportedNetworks } from 'modules/web3/constants/networks';
import { backoffRetry } from 'lib/utils';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { fetchPollTally } from 'modules/polling/api/fetchPollTally';
import { Poll, PollTally } from 'modules/polling/types';

export async function getPollTally(poll: Poll, network: SupportedNetworks): Promise<PollTally> {
  // const cacheKey = getPollTallyCacheKey(poll.pollId);
  // const cachedTally = await cacheGet(cacheKey, network);
  // if (cachedTally) {
  //   return JSON.parse(cachedTally);
  // }

  // Builds poll tally
  const tally: PollTally = await backoffRetry(3, () => fetchPollTally(poll, network));

  //const pollEnded = pollHasEnded(poll);

  // cacheSet(cacheKey, JSON.stringify(tally), network, pollEnded ? ONE_DAY_IN_MS : THIRTY_SECONDS_IN_MS);

  return tally;
}
