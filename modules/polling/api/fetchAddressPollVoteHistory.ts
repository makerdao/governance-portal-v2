import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollVote } from '../types';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { getPolls } from './fetchPolls';
import { fetchAllCurrentVotes } from './fetchAllCurrentVotes';
import { POLL_VOTE_TYPE } from '../polling.constants';

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

      let optionValue = '';
      if (poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE) {
        if (pollVote.rankedChoiceOption && pollVote.rankedChoiceOption.length > 0) {
          optionValue = poll.options[pollVote.rankedChoiceOption[0]];
        }
      } else {
        if (typeof pollVote.optionId !== 'undefined') {
          optionValue = poll.options[pollVote.optionId as number];
        }
      }

      return {
        ...pollVote,
        poll,
        optionValue: optionValue as string
      };
    })
  );

  return items.filter(pollVote => !!pollVote) as PollVoteHistory[];
}
