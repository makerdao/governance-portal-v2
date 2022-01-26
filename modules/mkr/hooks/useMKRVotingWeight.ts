import { BigNumber } from 'ethers';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';
import { getMKRVotingWeight } from '../helpers/getMKRVotingWeight';

type VotingWeightResponse = {
  data?: BigNumber;
  loading?: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMKRVotingWeight = (address?: string): VotingWeightResponse => {
  const { network } = useActiveWeb3React();
  const { data, error, mutate } = useSWR(
    address ? ['/user/polling-voting-weight', address] : null,
    () => getMKRVotingWeight(address as string, network),
    {
      revalidateOnFocus: true,
      refreshInterval: 30000
    }
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
