/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { fetchJson } from 'lib/fetchJson';
import { DelegatesPaginatedAPIResponse } from 'modules/delegates/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { DelegateOrderByEnum, DelegateTypeEnum, OrderDirectionEnum } from '../delegates.constants';
import { fetchDelegatesPaginated } from './fetchDelegates';

export type DelegatesQueryParams = {
  page?: number;
  includeExpired?: boolean;
  orderBy?: DelegateOrderByEnum;
  orderDirection?: OrderDirectionEnum;
  seed?: number;
  delegateType?: DelegateTypeEnum;
  name?: string | null;
  queryTags?: string[];
};

export async function fetchDelegatesPageData(
  network: SupportedNetworks,
  useApi = false,
  queryParams?: DelegatesQueryParams
): Promise<DelegatesPaginatedAPIResponse> {
  const pageSize = 30;
  const page = queryParams?.page || 1;
  const includeExpired = queryParams?.includeExpired || false;
  const orderBy = queryParams?.orderBy || DelegateOrderByEnum.RANDOM;
  const orderDirection = queryParams?.orderDirection || OrderDirectionEnum.DESC;
  const seed = queryParams?.seed || null;
  const delegateType = queryParams?.delegateType || DelegateTypeEnum.RECOGNIZED;
  const name = queryParams?.name || null;
  const queryTags = queryParams?.queryTags?.length ? queryParams.queryTags : null;

  const { delegates, stats, tags, paginationInfo } = useApi
    ? await fetchJson(
        `/api/delegates?network=${network}&pageSize=${pageSize}&page=${page}&includeExpired=${includeExpired}&orderBy=${orderBy}&orderDirection=${orderDirection}&delegateType=${delegateType}${
          name ? '&name=' + name : ''
        }${queryTags ? '&tags=' + queryTags.join(',') : ''}${seed ? '&seed=' + seed : ''}`
      )
    : await fetchDelegatesPaginated({
        network,
        pageSize,
        page,
        includeExpired,
        orderBy,
        orderDirection,
        seed,
        delegateType,
        name,
        tags: queryTags
      });

  return {
    delegates,
    stats,
    tags,
    paginationInfo
  };
}
