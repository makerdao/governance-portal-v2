import useSWR from 'swr';
import { ESModuleStats, fetchESModuleStats } from '../api/fetchESModuleStats';

type MkrBalanceResponse = {
  data?: ESModuleStats;
  loading?: boolean;
  error?: Error;
  mutate: () => void;
};

export const useESModuleStats = (address?: string): MkrBalanceResponse => {
  const { data, error, mutate } = useSWR(['/es-module', address], () => fetchESModuleStats(address), {
    revalidateOnMount: true
  });

  return {
    data: data,
    loading: !error && !data,
    error,
    mutate
  };
};
