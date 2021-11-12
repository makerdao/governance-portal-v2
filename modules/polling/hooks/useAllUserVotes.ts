import useSWR from 'swr';
import getMaker from 'lib/maker';
import { PollVote } from 'modules/polling/types';

type AllUserVotesResponse = {
  data?: PollVote[];
  loading: boolean;
  error?: Error;
  mutate: any;
};

export const useAllUserVotes = (address?: string): AllUserVotesResponse => {
  const { data, error, mutate } = useSWR<PollVote[]>(
    address ? `/user/voting-for/${address}` : null,
    () => {
      return getMaker().then(maker => maker.service('govPolling').getAllOptionsVotingFor(address));
    },
    { refreshInterval: 0 }
  );
  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
