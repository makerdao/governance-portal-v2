/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { AvcOrderByEnum } from '../avcs.constants';

export type Avc = {
  id: string;
  name: string;
  picture?: string;
  externalUrl: string;
  description: string;
  mkrDelegated: string;
  delegateCount: number;
};

export type AvcsQueryParams = {
  orderBy?: AvcOrderByEnum;
  searchTerm?: string | null;
};

export type AvcsValidatedQueryParams = {
  network: SupportedNetworks;
  orderBy: AvcOrderByEnum;
  searchTerm: string | null;
};

export type AvcsPageStats = {
  totalCount: number;
};

export type AvcsAPIResponse = {
  stats: AvcsPageStats;
  avcs: Avc[];
};
