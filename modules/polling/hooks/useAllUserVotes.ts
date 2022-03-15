import useSWR from 'swr';
import { PollVote } from 'modules/polling/types';
import { fetchAllCurrentVotes } from '../api/fetchAllCurrentVotes';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

type AllUserVotesResponse = {
  data?: PollVote[];
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useAllUserVotes = (address?: string): AllUserVotesResponse => {
  const { network } = useActiveWeb3React();
  const { data, error, mutate } = useSWR<PollVote[]>(
    address ? `/user/voting-for/${address}` : null,
    () => {
      return fetchAllCurrentVotes(address as string, network);
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
