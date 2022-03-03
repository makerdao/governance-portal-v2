import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR, { useSWRConfig } from 'swr';
import { Delegate } from '../types';

type DelegateAddressMapResponse = {
  data: Record<string, Delegate>;
  loading: boolean;
  error?: Error;
};

export const useDelegateAddressMap = (): DelegateAddressMapResponse => {
  const { network } = useActiveWeb3React();
  const { cache } = useSWRConfig();
  const dataKey = `/api/delegates/names?network=${network}`;

  const { data: delegates, error } = useSWR<Delegate[]>(dataKey, null, {
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
