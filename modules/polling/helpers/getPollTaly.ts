import BigNumber from 'bignumber.js';
import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { backoffRetry } from 'lib/utils';
import { fetchPollTally } from '../api/fetchPollTally';
import { POLL_VOTE_TYPE } from '../polling.constants';
import { Poll, PollTally, PollVoteType, RawPollTally, RawPollTallyRankedChoice } from '../types';

export async function getPollTally(poll: Poll, network: SupportedNetworks): Promise<PollTally> {
    
    // if poll vote type is unknown, treat as ranked choice
    const voteType: PollVoteType = poll.voteType || POLL_VOTE_TYPE.RANKED_VOTE;


    const tally: RawPollTally = await backoffRetry(3, () =>
      fetchPollTally(poll.pollId, voteType, false, network)
    );

    const maker = await getMaker(network);
    const votesByAddress: PollTallyVote[] = (
      await maker.service('govPolling').getMkrAmtVotedByAddress(pollId)
    ).sort((a, b) => (new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1));

    const totalMkrParticipation = tally.totalMkrParticipation;
    const winner: string = tally.winner || '';
    const numVoters = tally.numVoters;

    const parsedTally = {
      pollVoteType: voteType,
      options: tally.options,
      winner,
      totalMkrParticipation,
      numVoters,
      votesByAddress
    } as RawPollTally;

    if ('rounds' in tally) (parsedTally as RawPollTallyRankedChoice).rounds = tally.rounds;
}