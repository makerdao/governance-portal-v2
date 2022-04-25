import useSWR from 'swr';
import { fetchGasPrice } from '../helpers/fetchGasPrice';

type GasResponse = {
  data?: number | string | undefined;
  loading: boolean;
  error?: Error;
};

export const useGasPrice = (): GasResponse => {
  const { data, error } = useSWR('fetch-gas', () => fetchGasPrice('fast'), { refreshInterval: 15000 });

  return {
    data,
    loading: !error && !data,
    error
  };
};
