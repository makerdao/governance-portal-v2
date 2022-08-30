import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import useSWR, { useSWRConfig } from 'swr';
import { Delegate } from '../types';

type DelegateAddressMapResponse = {
  data: Record<string, Delegate>;
  loading: boolean;
  error?: Error;
};

export const useDelegateAddressMap = (): DelegateAddressMapResponse => {
  const { network } = useWeb3();
  const { cache } = useSWRConfig();
  const dataKey = `/api/delegates/names?network=${network}`;

  const { data: delegates, error } = useSWR<Delegate[]>(dataKey, null, {
    // refresh every 30 mins
    refreshInterval: 1800000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKey),
    revalidateOnReconnect: false
  });

  const data =
    delegates &&
    delegates.reduce((acc, cur) => {
      acc[cur.voteDelegateAddress] = cur;
      return acc;
    }, {});

  return {
    data: data || {},
    loading: !error && !data,
    error
  };
};
