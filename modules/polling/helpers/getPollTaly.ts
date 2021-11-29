import BigNumber from 'bignumber.js';
import { SupportedNetworks } from 'lib/constants';
import getMaker, { getNetwork } from 'lib/maker';
import { backoffRetry } from 'lib/utils';
import { fetchPollTally } from '../api/fetchPollTally';
import { POLL_VOTE_TYPE } from '../polling.constants';
import {
  Poll,
  PollTally,
  PollTallyVote,
  PollVoteType,
  RawPollTally,
  RawPollTallyRankedChoice
} from '../types';
import { parseRawPollTally } from './parseRawTally';

export async function getPollTally(poll: Poll, network?: SupportedNetworks): Promise<PollTally> {
  const currentNetwork = network || getNetwork();
  // if poll vote type is unknown, treat as ranked choice
  const voteType: PollVoteType = poll.voteType || POLL_VOTE_TYPE.RANKED_VOTE;

  // Builds raw poll tally
  const tally: RawPollTally = await backoffRetry(3, () =>
    fetchPollTally(poll.pollId, voteType, false, currentNetwork)
  );
  const maker = await getMaker(currentNetwork);
  const votesByAddress: PollTallyVote[] = (
    await maker.service('govPolling').getMkrAmtVotedByAddress(poll.pollId)
  ).sort((a, b) => (new BigNumber(a.mkrSupport).lt(new BigNumber(b.mkrSupport)) ? 1 : -1));

  const totalMkrParticipation = tally.totalMkrParticipation;
  const winner: string = tally.winner || '';
  const numVoters = tally.numVoters;

  const parsedTally = {
    pollVoteType: voteType,
    options:
      Object.keys(tally.options).length > 0
        ? tally.options
        : {
            '0': {
              mkrSupport: new BigNumber(0),
              winner: false
            },
            '1': {
              mkrSupport: new BigNumber(0),
              winner: false
            },
            '2': {
              mkrSupport: new BigNumber(0),
              winner: false
            }
          },
    winner,
    totalMkrParticipation,
    numVoters,
    votesByAddress
  } as RawPollTally;

  if ('rounds' in tally) (parsedTally as RawPollTallyRankedChoice).rounds = tally.rounds;

  // Return parsed tally
  return parseRawPollTally(parsedTally, poll);
}
