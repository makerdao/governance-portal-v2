import BigNumber from 'bignumber.js';
import { SupportedNetworks } from 'modules/web3/web3.constants';
import { getNetwork } from 'lib/maker';
import { backoffRetry } from 'lib/utils';
import { fetchPollTally } from '../api/fetchPollTally';
import { fetchVotesByAddresForPoll } from '../api/fetchVotesByAddress';
import { POLL_VOTE_TYPE } from '../polling.constants';
import { Poll, PollTally, PollVoteType, RawPollTally, RawPollTallyRankedChoice } from '../types';
import { parseRawPollTally } from './parseRawTally';

export async function getPollTally(poll: Poll, network?: SupportedNetworks): Promise<PollTally> {
  const currentNetwork = network || getNetwork();
  // if poll vote type is unknown, treat as ranked choice
  const voteType: PollVoteType = poll.voteType || POLL_VOTE_TYPE.RANKED_VOTE;

  // Builds raw poll tally
  const tally: RawPollTally = await backoffRetry(3, () =>
    fetchPollTally(poll.pollId, voteType, false, currentNetwork)
  );

  const votesByAddress = await fetchVotesByAddresForPoll(poll.pollId, currentNetwork);

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
