/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import useSWR, { SWRResponse, useSWRConfig } from 'swr';
import { DelegatesPaginatedAPIResponse } from 'modules/delegates/types';
import { DelegateInfo } from 'modules/delegates/types';
import { useChainId } from 'wagmi';
import { chainIdToNetworkName } from 'modules/web3/helpers/chain';

export const useLandingPageDelegates = (): [
  SWRResponse<DelegatesPaginatedAPIResponse>,
  SWRResponse<DelegateInfo[]>
] => {
  const chainId = useChainId();
  const network = chainIdToNetworkName(chainId);
  const { cache } = useSWRConfig();
  const delegatesDataKey = `/api/delegates/v2?network=${network}&delegateType=ALIGNED&pageSize=5&orderBy=MKR&orderDirection=DESC`;
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
