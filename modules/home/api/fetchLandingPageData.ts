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
import { BigNumber } from 'ethers';
import { fetchJson } from 'lib/fetchJson';
import { Delegate, DelegatesAPIStats } from 'modules/delegates/types';
import { PollOrderByEnum, PollStatusEnum } from 'modules/polling/polling.constants';
import { TagCount } from 'modules/app/types/tag';

export type LandingPageData = {
  proposals: Proposal[];
  activePolls: PollListItem[];
  endedPolls: PollListItem[];
  pollStats: PollsResponse['stats'];
  pollTags: TagCount[];
  delegates: Delegate[];
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
        fetchJson(`/api/polling/v2/all-polls?network=${network}&status=${PollStatusEnum.active}&pageSize=4`),
        fetchJson(`/api/polling/v2/all-polls?network=${network}&status=${PollStatusEnum.ended}&pageSize=2`),
        fetchMkrOnHat(network),
        fetchMkrInChief(network)
      ])
    : await Promise.allSettled([
        getExecutiveProposals({ start: 0, limit: EXEC_FETCH_SIZE, sortBy: EXEC_SORT_BY, network }),
        getPollsPaginated({ ...pollQueryVariables, pageSize: 4, status: PollStatusEnum.active }),
        getPollsPaginated({ ...pollQueryVariables, pageSize: 2, status: PollStatusEnum.ended }),
        fetchMkrOnHat(network),
        fetchMkrInChief(network)
      ]);

  // return null for any data we couldn't fetch
  const [proposals, activePollsData, endedPollsData, mkrOnHatResponse, mkrInChief] = responses.map(promise =>
    promise.status === 'fulfilled' ? promise.value : null
  );

  return {
    proposals: proposals ? (proposals as Proposal[]).filter(i => i.active) : [],
    activePolls: activePollsData ? (activePollsData as PollsPaginatedResponse).polls : [],
    endedPolls: endedPollsData ? (endedPollsData as PollsPaginatedResponse).polls : [],
    pollStats: activePollsData
      ? (activePollsData as PollsPaginatedResponse).stats
      : { active: 0, finished: 0, total: 0 },
    pollTags: activePollsData ? (activePollsData as PollsPaginatedResponse).tags : [],
    mkrOnHat: mkrOnHatResponse ? formatValue((mkrOnHatResponse as MkrOnHatResponse).mkrOnHat) : undefined,
    hat: mkrOnHatResponse ? (mkrOnHatResponse as MkrOnHatResponse).hat : undefined,
    mkrInChief: mkrInChief ? formatValue(mkrInChief as BigNumber) : undefined
  };
}
