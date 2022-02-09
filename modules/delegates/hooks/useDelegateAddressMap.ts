import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';
import { Delegate } from '../types';

type DelegateAddressMapResponse = {
  data: Record<string, Delegate>;
  loading: boolean;
  error?: Error;
};

export const useDelegateAddressMap = (): DelegateAddressMapResponse => {
  const { network } = useActiveWeb3React();

  const { data: delegates, error } = useSWR<Delegate[]>(`/api/delegates/names?network=${network}`, null, {
    refreshInterval: 0
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
