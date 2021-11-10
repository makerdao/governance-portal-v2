import useSWR from 'swr';
import { getNetwork } from 'lib/maker';
import { SpellData } from 'modules/executive/types/spellData';

type SpellDataResponse = {
  data?: SpellData;
  loading: boolean;
  error?: Error;
};

export const useSpellData = (proposalAddress: string): SpellDataResponse => {
  console.log({ proposalAddress });
  const { data, error } = useSWR<SpellData>(
    `/api/executive/analyze-spell/${proposalAddress}?network=${getNetwork()}`
  );

  return {
    data,
    loading: !error && !data,
    error
  };
};
