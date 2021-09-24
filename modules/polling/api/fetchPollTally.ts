import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { RawPollTally } from '../types';

export async function fetchPollTally(pollId: number, network?: SupportedNetworks): Promise<RawPollTally> {
  const maker = await getMaker(network);

  const cacheKey = `tally-${pollId}`;
  if (config.USE_FS_CACHE) {
    const cachedTally = fsCacheGet(cacheKey, network);
    if (cachedTally) {
      return JSON.parse(cachedTally);
    }
  }

  const tally = await maker.service('govPolling').getTallyRankedChoiceIrv(pollId);

  if (config.USE_FS_CACHE) {
    fsCacheSet(cacheKey, JSON.stringify(tally), network);
  }

  return tally;
}
