import { SupportedNetworks } from 'modules/web3/constants/networks';
import { cacheGet, cacheSet } from 'modules/cache/cache';
import { fetchPollTally } from 'modules/polling/api/fetchPollTally';
import { Poll, PollTally } from 'modules/polling/types';
import { getPollTallyCacheKey } from 'modules/cache/constants/cache-keys';
import { pollHasEnded } from './utils';
import { ONE_DAY_IN_MS, THIRTY_SECONDS_IN_MS } from 'modules/app/constants/time';

export async function getPollTally(poll: Poll, network: SupportedNetworks): Promise<PollTally> {
  const cacheKey = getPollTallyCacheKey(poll.pollId);
  const cachedTally = await cacheGet(cacheKey, network);
  if (cachedTally) {
    return JSON.parse(cachedTally);
  }

  // Builds poll tally
  const tally: PollTally = await fetchPollTally(poll, network);

  const pollEnded = pollHasEnded(poll);

  cacheSet(cacheKey, JSON.stringify(tally), network, pollEnded ? ONE_DAY_IN_MS : THIRTY_SECONDS_IN_MS);

  return tally;
}
