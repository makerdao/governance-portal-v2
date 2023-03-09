/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Delegate, DelegatePaginated } from './delegate';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { DelegateTypeEnum } from '../delegates.constants';
import { TagCount } from 'modules/app/types/tag';

export type DelegatesAPIStats = {
  total: number;
  shadow: number;
  recognized: number;
  totalMKRDelegated: string;
  totalDelegators: number;
};

export type DelegatesAPIResponse = {
  delegates: Delegate[];
  stats: DelegatesAPIStats;
  pagination?: {
    page: number;
    pageSize: number;
  };
};

export type DelegatesValidatedQueryParams = {
  network: SupportedNetworks;
  pageSize: number;
  page: number;
  includeExpired: boolean;
  orderBy: string;
  orderDirection: string;
  delegateType: DelegateTypeEnum;
  name: string | null;
  tags: string[] | null;
};

export type DelegatesPaginatedAPIResponse = {
  paginationInfo: {
    totalCount: number;
    page: number;
    numPages: number;
    hasNextPage: boolean;
  };
  stats: DelegatesAPIStats;
  delegates: DelegatePaginated[];
  tags: TagCount[];
};
