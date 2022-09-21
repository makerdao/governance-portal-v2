import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { getPolls } from './fetchPolls';
import { fetchAllCurrentVotes } from './fetchAllCurrentVotes';
import { PollTallyVote } from '../types';

export async function fetchAddressPollVoteHistory(
  address: string,
  network: SupportedNetworks
): Promise<PollVoteHistory[]> {
  // TODO: This is an innefective way to cross fetch titles and options. We should improve Spock DB to return the titles in the poll votes
  const pollsData = await getPolls({}, network);
  const voteHistory = await fetchAllCurrentVotes(address, network);
  const items = await Promise.all(
    voteHistory.map(async (pollVote: PollTallyVote): Promise<PollVoteHistory | null> => {
      const poll = pollsData.polls.find(poll => poll.pollId === pollVote.pollId);
      // This should not happen but we do it to avoid typescript checks with undefined values. We want to force poll always being something
      if (!poll) {
        return null;
      }

      const optionValue: string[] = [];
      if (pollVote.ballot && pollVote.ballot.length > 0) {
        pollVote.ballot.forEach(option => {
          optionValue.push(poll.options[option]);
        });
      }

      return {
        ...pollVote,
        poll,
        optionValue
      };
    })
  );

  return items.filter(pollVote => !!pollVote) as PollVoteHistory[];
}
