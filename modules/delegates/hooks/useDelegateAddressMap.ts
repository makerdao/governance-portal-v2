import { chainIdToNetworkName } from 'modules/web3/helpers/chain';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';
import useSWR from 'swr';

type DelegateAddressMapResponse = {
  data: Record<string, string>;
  loading: boolean;
  error?: Error;
};

export const useDelegateAddressMap = (): DelegateAddressMapResponse => {
  const { chainId } = useActiveWeb3React();

  const { data: delegatesApiResponse, error } = useSWR(
    `/api/delegates?network=${chainIdToNetworkName(chainId)}`,
    null,
    {
      refreshInterval: 0
    }
  );

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
