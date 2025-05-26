/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { getPollsPaginated } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { fetchSkyOnHat } from 'modules/executive/api/fetchSkyOnHat';
import { fetchSkyInChief } from 'modules/executive/api/fetchSkyInChief';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatValue } from 'lib/string';
import { Proposal } from 'modules/executive/types';
import { PollListItem } from 'modules/polling/types';
import { PollsPaginatedResponse, PollsResponse } from 'modules/polling/types/pollsResponse';
import { SkyOnHatResponse } from 'modules/executive/api/fetchSkyOnHat';
import { fetchJson } from 'lib/fetchJson';
import { PollOrderByEnum, SKY_PORTAL_START_DATE_MAINNET } from 'modules/polling/polling.constants';
import { DelegateInfo, DelegatePaginated, DelegatesApiStats } from 'modules/delegates/types';
import { TagCount } from 'modules/app/types/tag';

export type LandingPageData = {
  proposals: Proposal[];
  polls: PollListItem[];
  pollStats: PollsResponse['stats'];
  pollTags: TagCount[];
  delegates: DelegatePaginated[];
  delegatesInfo: DelegateInfo[];
  delegatesError: Error | null;
  stats?: DelegatesApiStats;
  skyOnHat?: string;
  hat?: string;
  skyInChief?: string;
};

export async function fetchLandingPageData(
  network: SupportedNetworks,
  useApi = false
): Promise<Partial<LandingPageData>> {
  const EXEC_FETCH_SIZE = 5;
  const EXEC_SORT_BY = 'active';

  const pollQueryVariables = {
    network,
    page: 1,
    title: null,
    orderBy: PollOrderByEnum.nearestEnd,
    status: null,
    tags: null,
    type: null,
    startDate: SKY_PORTAL_START_DATE_MAINNET,
    endDate: null
  };

  const responses = useApi
    ? await Promise.allSettled([
        fetchJson(
          `/api/executive?network=${network}&start=0&limit=${EXEC_FETCH_SIZE}&sortBy=${EXEC_SORT_BY}`
        ),
        fetchJson(`/api/polling/all-polls?network=${network}&pageSize=4`),
        fetchSkyOnHat(network),
        fetchSkyInChief(network)
      ])
    : await Promise.allSettled([
        getExecutiveProposals({ start: 0, limit: EXEC_FETCH_SIZE, sortBy: EXEC_SORT_BY, network }),
        getPollsPaginated({ ...pollQueryVariables, pageSize: 4 }),
        fetchSkyOnHat(network),
        fetchSkyInChief(network)
      ]);

  // return null for any data we couldn't fetch
  const [proposals, pollsData, skyOnHatResponse, skyInChief] = responses.map(promise =>
    promise.status === 'fulfilled' ? promise.value : null
  );

  return {
    proposals: proposals ? (proposals as Proposal[]).filter(i => i.active) : [],
    polls: pollsData ? (pollsData as PollsPaginatedResponse).polls : [],
    pollStats: pollsData ? (pollsData as PollsPaginatedResponse).stats : { active: 0, finished: 0, total: 0 },
    pollTags: pollsData ? (pollsData as PollsPaginatedResponse).tags : [],
    skyOnHat: skyOnHatResponse
      ? formatValue((skyOnHatResponse as SkyOnHatResponse).skyOnHat, 'wad', 2, true, false, 1e9)
      : undefined,
    hat: skyOnHatResponse ? (skyOnHatResponse as SkyOnHatResponse).hat : undefined,
    skyInChief:
      skyInChief === 0n || skyInChief
        ? formatValue(skyInChief as bigint, 'wad', 2, true, false, 1e9)
        : undefined
  };
}
