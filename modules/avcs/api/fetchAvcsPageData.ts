/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { SupportedNetworks } from 'modules/web3/constants/networks';
import { AvcOrderByEnum } from '../avcs.constants';
import { AvcsAPIResponse, AvcsQueryParams } from '../types/avc';
import { fetchJson } from 'lib/fetchJson';
import { fetchAvcs } from './fetchAvcs';

export async function fetchAvcsPageData(
  network: SupportedNetworks,
  useApi = false,
  queryParams?: AvcsQueryParams
): Promise<AvcsAPIResponse> {
  const orderBy = queryParams?.orderBy || AvcOrderByEnum.RANDOM;
  const searchTerm = queryParams?.searchTerm || null;

  const { avcs, stats } = useApi
    ? await fetchJson(
        `/api/avcs?network=${network}&orderBy=${orderBy}${searchTerm ? '&searchTerm=' + searchTerm : ''}`
      )
    : await fetchAvcs({
        network,
        orderBy,
        searchTerm
      });

  return {
    avcs,
    stats
  };
}
