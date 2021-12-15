import getMaker from 'lib/maker';
import useSWR from 'swr';
import { CurrencyObject } from 'modules/app/types/currency';

type VotingWeightResponse = {
  data?: {
    total: CurrencyObject;
  };
  loading?: boolean;
  error?: Error;
  mutate: () => void;
};

export const useMKRVotingWeight = (address?: string): VotingWeightResponse => {
  const { data, error, mutate } = useSWR(
    address ? ['/user/polling-voting-weight', address] : null,
    (_, address) => getMaker().then(maker => maker.service('govPolling').getMkrWeightFromChain(address)),
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
