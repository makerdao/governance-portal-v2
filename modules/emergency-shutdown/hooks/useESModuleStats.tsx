import useSWR from 'swr';
import { ESModuleStats, fetchESModuleStats } from '../api/fetchESModuleStats';

type MkrBalanceResponse = {
  data?: ESModuleStats;
  loading?: boolean;
  error?: Error;
};

export const useESModuleStats = (address?: string): MkrBalanceResponse => {
  const { data, error } = useSWR(['/es-module', address], () => fetchESModuleStats(address));

  return {
    data: data,
    loading: !error && !data,
    error
  };
};
