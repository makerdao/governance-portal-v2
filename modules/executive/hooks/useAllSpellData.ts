import useSWR from 'swr';
import { fetchJson } from 'lib/fetchJson';
import { SpellData } from '../types';
import { SupportedNetworks } from 'modules/web3/constants/networks';

type SpellDataResponse = {
  data?: Record<string, SpellData>;
  loading: boolean;
  error?: any;
};

export const useAllSpellData = (addresses: string[], network: SupportedNetworks): SpellDataResponse => {
  const { data, error } = useSWR<Record<string, SpellData>>(
    `/api/executive/analyze-spell?network=${network}`,
    // needs to be a POST because the list of addresses is too long to be a GET query parameter
    url => fetchJson(url, { method: 'POST', body: JSON.stringify({ addresses }) }),

    { refreshInterval: 0 }
  );

  return {
    data,
    loading: !data && !error,
    error
  };
};
