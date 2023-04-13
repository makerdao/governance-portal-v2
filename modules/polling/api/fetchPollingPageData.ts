/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { getPollsPaginated } from 'modules/polling/api/fetchPolls';
import { Poll } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { fetchJson } from 'lib/fetchJson';
import { PollInputFormat, PollOrderByEnum, PollStatusEnum } from '../polling.constants';
import { PollsPaginatedResponse } from '../types/pollsResponse';

export type PollsQueryParams = {
  page?: number;
  orderBy?: PollOrderByEnum;
  status?: PollStatusEnum;
  title?: string | null;
  queryTags?: string[];
  type?: PollInputFormat[];
  startDate?: Date;
  endDate?: Date;
};

export type PollingReviewPageData = {
  polls: Poll[];
};

export async function fetchPollingPageData(
  network: SupportedNetworks,
  useApi = false,
  queryParams?: PollsQueryParams
): Promise<PollsPaginatedResponse> {
  const pageSize = 30;
  const page = queryParams?.page || 1;
  const orderBy = queryParams?.orderBy || PollOrderByEnum.nearestEnd;
  const status = queryParams?.status || PollStatusEnum.active;
  const title = queryParams?.title || null;
  const queryTags = queryParams?.queryTags || null;
  const type = queryParams?.type || null;
  const startDate = queryParams?.startDate || null;
  const endDate = queryParams?.endDate || null;

  const { polls, tags, stats, paginationInfo }: PollsPaginatedResponse = useApi
    ? await fetchJson(
        `/api/polling/v2/all-polls?network=${network}&pageSize=${pageSize}&page=${page}&orderBy=${orderBy}&status=${status}${
          title ? '&title=' + title : ''
        }${queryTags ? '&tags=' + queryTags.join(',') : ''}${type ? '&type=' + type : ''}${
          startDate ? '&startDate=' + startDate : ''
        }${endDate ? '&endDate=' + endDate : ''}`
      )
    : await getPollsPaginated({
        network,
        pageSize,
        page,
        orderBy,
        status,
        title,
        tags: queryTags,
        type,
        startDate,
        endDate
      });

  return {
    polls,
    tags,
    stats,
    paginationInfo
  };
}
