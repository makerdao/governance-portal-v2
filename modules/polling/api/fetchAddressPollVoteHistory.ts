import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollVote } from '../types';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { getPolls } from './fetchPolls';
import { fetchAllCurrentVotes } from './fetchAllCurrentVotes';
import { PollInputFormat } from '../polling.constants';

export async function fetchAddressPollVoteHistory(
  address: string,
  network: SupportedNetworks
): Promise<PollVoteHistory[]> {
  // TODO: This is an innefective way to cross fetch titles and options. We should improve Spock DB to return the titles in the poll votes
  const pollsData = await getPolls({}, network);
  const voteHistory = await fetchAllCurrentVotes(address, network);
  const items = await Promise.all(
    voteHistory.map(async (pollVote: PollVote): Promise<PollVoteHistory | null> => {
      const poll = pollsData.polls.find(poll => poll.pollId === pollVote.pollId);
      // This should not happen but we do it to avoid typescript checks with undefined values. We want to force poll always being something
      if (!poll) {
        return null;
      }

      const optionValue: string[] = [];
      if (poll.parameters.inputFormat === PollInputFormat.rankFree) {
        if (pollVote.rankedChoiceOption && pollVote.rankedChoiceOption.length > 0) {
          pollVote.rankedChoiceOption.forEach(option => {
            optionValue.push(poll.options[option])
          })
        }
      } else {
        if (typeof pollVote.optionId !== 'undefined') {
          optionValue.push(poll.options[pollVote.optionId as number]);
        }
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
