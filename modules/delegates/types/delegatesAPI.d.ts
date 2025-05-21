/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { DelegatePaginated } from './delegate';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { DelegateTypeEnum } from '../delegates.constants';

export type DelegatesApiStats = {
  total: number;
  shadow: number;
  aligned: number;
  totalSkyDelegated: number;
  totalDelegators: number;
};

export type DelegatesValidatedQueryParams = {
  network: SupportedNetworks;
  pageSize: number;
  page: number;
  orderBy: string;
  orderDirection: string;
  seed: number | null;
  delegateType: DelegateTypeEnum;
  searchTerm: string | null;
};

export type DelegatesPaginatedAPIResponse = {
  paginationInfo: {
    totalCount: number;
    page: number;
    numPages: number;
    hasNextPage: boolean;
  };
  stats: DelegatesApiStats;
  delegates: DelegatePaginated[];
};
