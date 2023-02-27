/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import useSWR, { SWRResponse, useSWRConfig } from 'swr';
import { DelegatesPaginatedAPIResponse } from 'modules/delegates/types';
import { DelegateNameAndMetrics } from 'modules/delegates/types';

export const useLandingPageDelegates = (): [
  SWRResponse<DelegatesPaginatedAPIResponse>,
  SWRResponse<DelegateNameAndMetrics[]>
] => {
  const { network } = useWeb3();
  const { cache } = useSWRConfig();
  const delegatesDataKey = `/api/delegates?network=${network}&delegateType=RECOGNIZED&pageSize=5&orderBy=MKR`;
  const delegateNamesAndMetricsDataKey = `/api/delegates/namesAndMetrics?network=${network}`;

  const swrConfigObject = {
    // refresh every 30 mins
    refreshInterval: 1800000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(delegatesDataKey),
    revalidateOnReconnect: false
  };

  const delegatesResponse = useSWR<DelegatesPaginatedAPIResponse>(delegatesDataKey, null, swrConfigObject);
  const delegateNamesAndMetricsResponse = useSWR<DelegateNameAndMetrics[]>(
    delegateNamesAndMetricsDataKey,
    null,
    swrConfigObject
  );

  return [delegatesResponse, delegateNamesAndMetricsResponse];
};
