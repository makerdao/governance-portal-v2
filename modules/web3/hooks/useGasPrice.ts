import useSWR from 'swr';
import { SupportedNetworks } from '../constants/networks';
import { fetchGasPrice } from '../helpers/fetchGasPrice';

type GasResponse = {
  data?: number | string | undefined;
  loading: boolean;
  error?: Error;
};

export const useGasPrice = ({ network }: { network: SupportedNetworks }): GasResponse => {
  const { data, error } = useSWR(
    network && network === SupportedNetworks.MAINNET ? 'fetch-gas' : null,
    () => fetchGasPrice('fast'),
    { refreshInterval: 15000 }
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
