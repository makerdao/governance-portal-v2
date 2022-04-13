import { SupportedNetworks } from 'modules/web3/constants/networks';
import { backoffRetry } from 'lib/utils';
import BigNumber from 'bignumber.js';
import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { fetchRawPollTally } from 'modules/polling/api/fetchRawPollTally';
import { fetchVotesByAddressForPoll } from 'modules/polling/api/fetchVotesByAddress';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';
import { Poll, PollTally, PollVoteType, RawPollTally, RawPollTallyRankedChoice } from 'modules/polling/types';
import { parseRawPollTally } from 'modules/polling/helpers/parseRawTally';
import { isActivePoll } from 'modules/polling/helpers/utils';

export async function getPollTally(poll: Poll, network: SupportedNetworks): Promise<PollTally> {
  const cacheKey = `${network}-parsed-tally-${poll.pollId}`;
  if (config.USE_FS_CACHE) {
    const cachedTally = fsCacheGet(cacheKey, network);
    if (cachedTally) {
      return JSON.parse(cachedTally);
    }
  }

  // if poll vote type is unknown, treat as ranked choice
  const voteType: PollVoteType = poll.voteType || POLL_VOTE_TYPE.RANKED_VOTE;

  // Builds raw poll tally
  const tally: RawPollTally = await backoffRetry(3, () => fetchRawPollTally(poll.pollId, voteType, network));

  const endUnix = new Date(poll.endDate).getTime() / 1000;
  const votesByAddress = await fetchVotesByAddressForPoll(poll.pollId, endUnix, network);

  const totalMkrParticipation = tally.totalMkrParticipation;
  const winner: string = tally.winner || '';
  const numVoters = tally.numVoters;

  const tallyObject = {
    pollVoteType: voteType,
    options:
      Object.keys(tally.options).length > 0
        ? tally.options
        : {
            '0': {
              mkrSupport: new BigNumber('0'),
              winner: false
            },
            '1': {
              mkrSupport: new BigNumber('0'),
              winner: false
            },
            '2': {
              mkrSupport: new BigNumber('0'),
              winner: false
            }
          },
    winner,
    totalMkrParticipation,
    numVoters,
    votesByAddress
  } as RawPollTally;

  if ('rounds' in tally) (tallyObject as RawPollTallyRankedChoice).rounds = tally.rounds;

  const parsedTally = parseRawPollTally(tallyObject, poll);

  if (config.USE_FS_CACHE && !isActivePoll(poll)) {
    fsCacheSet(cacheKey, JSON.stringify(parsedTally), network);
  }

  return parsedTally;
}
