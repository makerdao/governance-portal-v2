import useSWR from 'swr';
import { SpellData } from 'modules/executive/types/spellData';
import { useActiveWeb3React } from 'modules/web3/hooks/useActiveWeb3React';

type SpellDataResponse = {
  data?: SpellData;
  loading: boolean;
  error?: Error;
  mutate: any;
};

export const useSpellData = (proposalAddress: string): SpellDataResponse => {
  const { network } = useActiveWeb3React();

  const { data, error, mutate } = useSWR<SpellData>(
    `/api/executive/analyze-spell/${proposalAddress}?network=${network}`
  );

  return {
    data,
    loading: !error && !data,
    error,
    mutate
  };
};
