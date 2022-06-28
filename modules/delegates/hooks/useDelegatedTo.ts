import { fetchJson } from 'lib/fetchJson';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { MKRDelegatedToAPIResponse } from 'pages/api/address/[address]/delegated-to';
import useSWR from 'swr';

export default function useDelegatedTo(
  address: string | undefined,
  network: SupportedNetworks
): {
  data: MKRDelegatedToAPIResponse | undefined;
} {
  const { data } = useSWR<MKRDelegatedToAPIResponse>(
    address ? `/api/address/${address}/delegated-to?network=${network}` : null,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  return {
    data
  };
}
