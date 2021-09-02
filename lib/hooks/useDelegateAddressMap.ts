import useSWR from 'swr';
import { getNetwork } from 'lib/maker';

type DelegateAddressMapResponse = {
  data: Record<string, string>;
  loading: boolean;
  error?: Error;
};

export const useDelegateAddressMap = (): DelegateAddressMapResponse => {
  const { data: delegatesApiResponse, error } = useSWR(`/api/delegates?network=${getNetwork()}`);

  const data =
    delegatesApiResponse &&
    delegatesApiResponse.delegates.reduce((acc, cur) => {
      const formattedName = !cur.name || cur.name === '' ? 'Shadow Delegate' : cur.name;
      acc[cur.voteDelegateAddress] = formattedName;
      return acc;
    }, {});

  return {
    data: data || {},
    loading: !error && !data,
    error
  };
};
