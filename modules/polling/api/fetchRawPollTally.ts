import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollVoteType, RawPollTally } from 'modules/polling/types';
import { POLL_VOTE_TYPE } from 'modules/polling/polling.constants';
import { fetchTallyPlurality } from './fetchTallyPlurality';
import { fetchTallyRankedChoice } from './fetchTallyRankedChoice';

export async function fetchRawPollTally(
  pollId: number,
  voteType: PollVoteType,
  network: SupportedNetworks
): Promise<RawPollTally> {
  let tally;
  if (voteType === POLL_VOTE_TYPE.PLURALITY_VOTE) {
    tally = await fetchTallyPlurality(pollId, network);
  } else {
    tally = await fetchTallyRankedChoice(pollId, network);
  }

  return tally;
}
