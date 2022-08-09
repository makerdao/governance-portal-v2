import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import useSWR, { SWRResponse, useSWRConfig } from 'swr';
import { DelegatesAPIResponse } from '../types';

export const useDelegates = (): SWRResponse<DelegatesAPIResponse> => {
  const { network } = useWeb3();
  const { cache } = useSWRConfig();
  const dataKey = `/api/delegates?network=${network}`;

  return useSWR<DelegatesAPIResponse>(dataKey, null, {
    // refresh every 30 mins
    refreshInterval: 1800000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKey),
    revalidateOnReconnect: false
  });
};
