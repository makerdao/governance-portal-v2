/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Delegate } from './delegate';
import { SupportedNetworks } from 'modules/web3/constants/networks';

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

export type DelegatesAPIQueryParams = {
  network: SupportedNetworks;
  first: number;
  after: string | null;
  includeExpired: boolean;
  orderBy: string;
  orderDirection: string;
  status: string;
};
