/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR, { SWRResponse, useSWRConfig } from 'swr';
import { DelegatesPaginatedAPIResponse } from 'modules/delegates/types';
import { DelegateInfo } from 'modules/delegates/types';
import { useNetwork } from 'modules/app/hooks/useNetwork';
import {
  DelegateOrderByEnum,
  OrderDirectionEnum,
  DelegateTypeEnum
} from 'modules/delegates/delegates.constants';

export const useLandingPageDelegates = (): [
  SWRResponse<DelegatesPaginatedAPIResponse>,
  SWRResponse<DelegateInfo[]>
] => {
  const network = useNetwork();
  const { cache } = useSWRConfig();
  const delegatesDataKey = `/api/delegates?network=${network}&delegateType=${DelegateTypeEnum.ALIGNED}&orderBy=${DelegateOrderByEnum.SKY}&orderDirection=${OrderDirectionEnum.DESC}&pageSize=0`;
  const delegatesInfoDataKey = `/api/delegates/info?network=${network}`;

  const swrConfigObject = {
    // refresh every 30 mins
    refreshInterval: 1800000,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: !cache.get(delegatesDataKey),
    revalidateOnReconnect: false
  };

  const delegatesResponse = useSWR<DelegatesPaginatedAPIResponse>(delegatesDataKey, null, swrConfigObject);
  const delegatesInfoResponse = useSWR<DelegateInfo[]>(delegatesInfoDataKey, null, swrConfigObject);
  return [delegatesResponse, delegatesInfoResponse];
};
