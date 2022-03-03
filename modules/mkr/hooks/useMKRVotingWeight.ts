import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR, { useSWRConfig } from 'swr';
import { getMKRVotingWeight, MKRVotingWeightResponse } from '../helpers/getMKRVotingWeight';

type VotingWeightResponse = {
  data?: MKRVotingWeightResponse;
  loading?: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMKRVotingWeight = (address?: string): VotingWeightResponse => {
  const { network } = useActiveWeb3React();
  const { cache } = useSWRConfig();

  const dataKey = `/user/polling-voting-weight/${address}/${network}`;

  // Only revalidate every 60 seconds, do not revalidate on mount if it's already fetched
  const { data, error, mutate } = useSWR(
    address ? dataKey : null,
    () => getMKRVotingWeight(address as string, network),
    {
      revalidateOnFocus: false,
      revalidateOnMount: !cache.get(dataKey),
      refreshInterval: 60000
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
