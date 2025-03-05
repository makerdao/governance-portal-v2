/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR, { useSWRConfig } from 'swr';
import { DelegateInfo } from '../types';
import { useNetwork } from 'modules/app/hooks/useNetwork';

type DelegateInfoResponse = {
  data: DelegateInfo | null;
  loading: boolean;
  error?: Error;
};

export const useSingleDelegateInfo = (address: string): DelegateInfoResponse => {
  const network = useNetwork();
  const { cache } = useSWRConfig();
  const dataKey = `/api/delegates/${address}/info?network=${network}`;

  const { data: delegate, error } = useSWR<DelegateInfo | null>(dataKey, null, {
    // refresh every 30 mins
    refreshInterval: 1800000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKey),
    revalidateOnReconnect: false
  });

  return {
    data: delegate || null,
    loading: !error && !delegate,
    error
  };
};
