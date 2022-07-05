import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { AddressApiResponse } from 'modules/address/types/addressApiResponse';

export function useAddressInfo(
  address: string | undefined,
  network: SupportedNetworks
): {
  data: AddressApiResponse | undefined;
  error: Error;
} {
  const { data, error } = useSWR<AddressApiResponse>(
    address ? `/api/address/${address}?network=${network}` : null,
    fetchJson,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      revalidateOnMount: true
    }
  );

  return {
    data,
    error
  };
}
