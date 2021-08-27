import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { PollVote } from '../types';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { getPolls } from './fetchPolls';
import { fetchPollTally } from './fetchPollTally';

export async function fetchAddressPollVoteHistory(address:string, network: SupportedNetworks): Promise<PollVoteHistory[]> {
  const maker = await getMaker(network);

  // TODO: This is an innefective way to cross fetch titles and options. We should improve Spock DB to return the titles in the poll votes
  const polls = await getPolls(network);

  const voteHistory = await maker
    .service('govPolling')
    .getAllOptionsVotingFor(address);

  const items = await Promise.all(voteHistory
    .map(async (pollVote: PollVote): Promise<PollVoteHistory|null> => {
      const poll = polls.find(poll => poll.pollId === pollVote.pollId);
      // This should not happen but we do it to avoid typescript checks with undefined values. We want to force poll always being something
      if (!poll) {
        return null;
      }

      const tally = await fetchPollTally(pollVote.pollId, network);

      const optionValue = poll  && poll.voteType === 'Ranked Choice IRV' 
        ? (pollVote.rankedChoiceOption && typeof pollVote.rankedChoiceOption[0] !== 'undefined' ?  poll.options[pollVote.rankedChoiceOption[0]]: '' )
        : (typeof pollVote.option !== 'undefined' ? poll.options[pollVote.option] :  '');

      return {
        ...pollVote,
        poll,
        tally,
        optionValue: optionValue as string
      };
    }));

  return items.filter(pollVote => !!pollVote) as PollVoteHistory[];
}

