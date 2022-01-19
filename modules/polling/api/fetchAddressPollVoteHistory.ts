import { SupportedNetworks } from 'modules/web3/constants/networks';
import getMaker from 'lib/maker';
import { PollVote } from '../types';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { getPolls } from './fetchPolls';

export async function fetchAddressPollVoteHistory(
  address: string,
  network: SupportedNetworks
): Promise<PollVoteHistory[]> {
  const maker = await getMaker(network);

  // TODO: This is an innefective way to cross fetch titles and options. We should improve Spock DB to return the titles in the poll votes
  const pollsData = await getPolls({}, network);

  const voteHistory = await maker.service('govPolling').getAllOptionsVotingFor(address);

  const items = await Promise.all(
    voteHistory.map(async (pollVote: PollVote): Promise<PollVoteHistory | null> => {
      const poll = pollsData.polls.find(poll => poll.pollId === pollVote.pollId);
      // This should not happen but we do it to avoid typescript checks with undefined values. We want to force poll always being something
      if (!poll) {
        return null;
      }

      const optionValue =
        pollVote.rankedChoiceOption && pollVote.rankedChoiceOption?.length > 0
          ? poll.options[pollVote.rankedChoiceOption[0]]
          : (pollVote.option as number) !== undefined
          ? poll.options[pollVote.option as number]
          : '';

      return {
        ...pollVote,
        poll,
        optionValue: optionValue as string
      };
    })
  );

  return items.filter(pollVote => !!pollVote) as PollVoteHistory[];
}
