import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { PollVoteType, RawPollTally } from 'modules/polling/types';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';

export async function fetchPollTally(
  pollId: number,
  voteType: PollVoteType,
  useCache: boolean,
  network?: SupportedNetworks
): Promise<RawPollTally> {
  const maker = await getMaker(network);

  const cacheKey = `tally-${pollId}`;
  if (config.USE_FS_CACHE && useCache) {
    const cachedTally = fsCacheGet(cacheKey, network);
    if (cachedTally) {
      return JSON.parse(cachedTally);
    }
  }

  let tally;
  if (voteType === POLL_VOTE_TYPE.PLURALITY_VOTE) {
    tally = await maker.service('govPolling').getTallyPlurality(pollId);
  } else {
    tally = await maker.service('govPolling').getTallyRankedChoiceIrv(pollId);
  }

  if (config.USE_FS_CACHE && useCache) {
    fsCacheSet(cacheKey, JSON.stringify(tally), network);
  }

  return tally;
}
