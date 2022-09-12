import useSWR, { useSWRConfig } from 'swr';
import { SpellData } from 'modules/executive/types/spellData';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { fetchJson } from 'lib/fetchJson';

type SpellDataResponse = {
  data?: SpellData;
  loading: boolean;
  error?: Error;
  mutate: any;
};

export const useSpellData = (proposalAddress: string): SpellDataResponse => {
  const { network } = useWeb3();

  const dataKey = proposalAddress
    ? `/api/executive/analyze-spell/${proposalAddress}?network=${network}`
    : null;
  const { cache } = useSWRConfig();

  const { data, error, mutate } = useSWR<SpellData>(dataKey, fetchJson, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKey),
    revalidateOnReconnect: false
  });

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
