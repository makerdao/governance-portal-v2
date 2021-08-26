import { SupportedNetworks } from 'lib/constants';
import getMaker from 'lib/maker';
import { PollVote } from '../types';
import { PollVoteHistory } from '../types/pollVoteHistory';
import { getPolls } from './fetchPolls';

export async function fetchAddressPollVoteHistory(address:string, network: SupportedNetworks): Promise<PollVoteHistory[]> {
  const maker = await getMaker(network);

  // TODO: This is an innefective way to cross fetch titles and options. We should improve Spock DB to return the titles in the poll votes
  const polls = await getPolls(network);

  const voteHistory = await maker
    .service('govPolling')
    .getAllOptionsVotingFor(address);

  return voteHistory.map((pollVote: PollVote): PollVoteHistory => {
    const poll = polls.find(poll => poll.pollId === pollVote.pollId);
    
    return {
      ...pollVote,
      title: poll ? poll.title:  '',
      optionValue: poll && pollVote.option ? poll.options[pollVote.option]: ''
    };
  });
}

