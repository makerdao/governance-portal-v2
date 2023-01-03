/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import useSWR, { SWRResponse, useSWRConfig } from 'swr';
import { DelegatesAPIResponse } from 'modules/delegates/types';

export const useAllDelegates = (): SWRResponse<DelegatesAPIResponse> => {
  const { network } = useWeb3();
  const { cache } = useSWRConfig();
  const dataKey = `/api/delegates?network=${network}`;

  const response = useSWR<DelegatesAPIResponse>(dataKey, null, {
    // refresh every 30 mins
    refreshInterval: 1800000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(dataKey),
    revalidateOnReconnect: false
  });
  return response;
};
