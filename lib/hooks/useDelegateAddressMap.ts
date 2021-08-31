import useSWR from 'swr';
import { getNetwork } from 'lib/maker';
import { fetchDelegates } from 'modules/delegates/api/fetchDelegates';

type DelegateAddressMapResponse = {
  data: Record<string, string>;
  loading: boolean;
  error?: Error;
};

export const useDelegateAddressMap = (): DelegateAddressMapResponse => {
  const { data, error } = useSWR(
    '/delegate-address-map',
    async () => {
      const delegatesResponse = await fetchDelegates(getNetwork());
      const addressMap = delegatesResponse.delegates.reduce((acc, cur) => {
        const formattedName = !cur.name || cur.name === '' ? 'Shadow Delegate' : cur.name;
        acc[cur.voteDelegateAddress] = formattedName;
        return acc;
      }, {});

      return addressMap;
    },
    { refreshInterval: 30000 }
  );

  return {
    data: data || {},
    loading: !error && !data,
    error
  };
};
