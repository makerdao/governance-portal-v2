/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { getPollsPaginated } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { fetchMkrOnHat } from 'modules/executive/api/fetchMkrOnHat';
import { fetchMkrInChief } from 'modules/executive/api/fetchMkrInChief';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatValue } from 'lib/string';
import { Proposal } from 'modules/executive/types';
import { PollListItem } from 'modules/polling/types';
import { PollsPaginatedResponse, PollsResponse } from 'modules/polling/types/pollsResponse';
import { MkrOnHatResponse } from 'modules/executive/api/fetchMkrOnHat';
import { fetchJson } from 'lib/fetchJson';
import { PollOrderByEnum } from 'modules/polling/polling.constants';
import { DelegateInfo, DelegatePaginated, DelegatesAPIStats } from 'modules/delegates/types';
import { TagCount } from 'modules/app/types/tag';

export type LandingPageData = {
  proposals: Proposal[];
  polls: PollListItem[];
  pollStats: PollsResponse['stats'];
  pollTags: TagCount[];
  delegates: DelegatePaginated[];
  delegatesInfo: DelegateInfo[];
  stats?: DelegatesAPIStats;
  mkrOnHat?: string;
  hat?: string;
  mkrInChief?: string;
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
    startDate: null,
    endDate: null
  };

  const responses = useApi
    ? await Promise.allSettled([
        fetchJson(
          `/api/executive?network=${network}&start=0&limit=${EXEC_FETCH_SIZE}&sortBy=${EXEC_SORT_BY}`
        ),
        fetchJson(`/api/polling/v2/all-polls?network=${network}&pageSize=4`),
        fetchMkrOnHat(network),
        fetchMkrInChief(network)
      ])
    : await Promise.allSettled([
        getExecutiveProposals({ start: 0, limit: EXEC_FETCH_SIZE, sortBy: EXEC_SORT_BY, network }),
        getPollsPaginated({ ...pollQueryVariables, pageSize: 4 }),
        fetchMkrOnHat(network),
        fetchMkrInChief(network)
      ]);

  // return null for any data we couldn't fetch
  const [proposals, pollsData, mkrOnHatResponse, mkrInChief] = responses.map(promise =>
    promise.status === 'fulfilled' ? promise.value : null
  );

  return {
    proposals: proposals ? (proposals as Proposal[]).filter(i => i.active) : [],
    polls: pollsData ? (pollsData as PollsPaginatedResponse).polls : [],
    pollStats: pollsData ? (pollsData as PollsPaginatedResponse).stats : { active: 0, finished: 0, total: 0 },
    pollTags: pollsData ? (pollsData as PollsPaginatedResponse).tags : [],
    mkrOnHat: mkrOnHatResponse ? formatValue((mkrOnHatResponse as MkrOnHatResponse).mkrOnHat) : undefined,
    hat: mkrOnHatResponse ? (mkrOnHatResponse as MkrOnHatResponse).hat : undefined,
    mkrInChief: mkrInChief === 0n || mkrInChief ? formatValue(mkrInChief as bigint) : undefined
  };
}
