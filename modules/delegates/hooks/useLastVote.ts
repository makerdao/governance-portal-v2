import useSWR from 'swr';
import { PollVoteHistory } from 'modules/polling/types/pollVoteHistory';
import { fetchJson } from 'lib/fetchJson';
import { SupportedNetworks } from 'modules/web3/constants/networks';

type LastVoteResponse = {
  data?: Record<string, PollVoteHistory>;
  loading: boolean;
  error?: any;
};

export const useLastVote = (voteDelegateAddress: string, network: SupportedNetworks): LastVoteResponse => {
  const { data, error } = useSWR<{ lastVote: PollVoteHistory }>(
    `/api/address/${voteDelegateAddress}/last-vote?network=${network}`,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0
    }
  );

  return {
    data,
    loading: !data && !error,
    error
  };
};
