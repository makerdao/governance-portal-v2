import useSWR from 'swr';
import getMaker from 'lib/maker';
import { PollVote } from 'modules/polling/types';

type AllUserVotesResponse = {
  data?: PollVote[];
  loading: boolean;
  error?: Error;
};

export const useAllUserVotes = (address?: string): AllUserVotesResponse => {
  const { data, error } = useSWR<PollVote[]>(
    address ? ['/user/voting-for', address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address)),
    { refreshInterval: 0 }
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
