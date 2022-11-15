import useSWR from 'swr';
import { PollTallyVote } from 'modules/polling/types';
import { fetchAllCurrentVotes } from '../api/fetchAllCurrentVotes';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';

type AllUserVotesResponse = {
  data?: PollTallyVote[];
  loading: boolean;
  error?: Error;
  mutate: () => void;
};

export const useAllUserVotes = (address?: string): AllUserVotesResponse => {
  const { network } = useWeb3();

  // TODO: remove this mock pagination
  const [first, offset] = [2, 0];
  const queryVariables = { argAddress: address?.toLowerCase(), first, offset };
  const { data, error, mutate } = useSWR<PollTallyVote[]>(
    address ? `/user/voting-for/${address}` : null,
    () => {
      return fetchAllCurrentVotes(address as string, network, queryVariables);
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
