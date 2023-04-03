/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import useSWR, { useSWRConfig } from 'swr';
import { DelegateInfo } from '../types';

type DelegateInfoResponse = {
  data: DelegateInfo | null;
  loading: boolean;
  error?: Error;
};

export const useSingleDelegateInfo = (address: string): DelegateInfoResponse => {
  const { network } = useWeb3();
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
