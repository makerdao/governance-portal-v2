/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR, { useSWRConfig } from 'swr';
import { SpellData } from 'modules/executive/types/spellData';
import { fetchJson } from 'lib/fetchJson';
import { useNetwork } from 'modules/app/hooks/useNetwork';

type SpellDataResponse = {
  data?: SpellData;
  loading: boolean;
  error?: Error;
  mutate: any;
};

export const useSpellData = (proposalAddress: string): SpellDataResponse => {
  const network = useNetwork();

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
