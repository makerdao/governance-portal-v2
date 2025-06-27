/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { getPollsPaginated } from 'modules/polling/api/fetchPolls';
import { getExecutiveProposals } from 'modules/executive/api/fetchExecutives';
import { fetchMkrInChief } from 'modules/executive/api/fetchMkrInChief';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { formatValue } from 'lib/string';
import { Proposal, SkyProposal } from 'modules/executive/types';
import { PollListItem } from 'modules/polling/types';
import { PollsPaginatedResponse, PollsResponse } from 'modules/polling/types/pollsResponse';
import { fetchJson } from 'lib/fetchJson';
import { PollOrderByEnum } from 'modules/polling/polling.constants';
import { TagCount } from 'modules/app/types/tag';
import { DelegatesAPIStats } from 'modules/delegates/types';

export type LandingPageData = {
  proposals: Proposal[];
  skyExecutive?: SkyProposal;
  skyHatInfo?: { hatAddress: string; skyOnHat: string };
  polls: PollListItem[];
  pollStats: PollsResponse['stats'];
  pollTags: TagCount[];
  stats?: DelegatesAPIStats;
  mkrInChief?: string;
};

async function fetchSkyExecutivesDirectly() {
  try {
    const response = await fetch('https://vote.sky.money/api/executive?start=0&limit=1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch Sky executives:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Sky executives:', error);
    return null;
  }
}

async function fetchSkyHatDirectly() {
  try {
    const response = await fetch('https://vote.sky.money/api/chief/hat', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Failed to fetch Sky hat:', response.status);
      return null;
    }
    
    const data = await response.json();
    return {
      hatAddress: data.hatAddress,
      skyOnHat: data.approvals
    };
  } catch (error) {
    console.error('Error fetching Sky hat:', error);
    return null;
  }
}

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
        fetchMkrInChief(network),
        fetchJson(`/api/sky/executives?pageSize=1&page=1`).catch(err => {
          console.error('Failed to fetch Sky executives:', err);
          return null;
        }),
        fetchJson(`/api/sky/hat`).catch(err => {
          console.error('Failed to fetch Sky hat info:', err);
          return null;
        })
      ])
    : await Promise.allSettled([
        getExecutiveProposals({ start: 0, limit: EXEC_FETCH_SIZE, sortBy: EXEC_SORT_BY, network }),
        getPollsPaginated({ ...pollQueryVariables, pageSize: 4 }),
        fetchMkrInChief(network),
        fetchSkyExecutivesDirectly(),
        fetchSkyHatDirectly()
      ]);

  // return null for any data we couldn't fetch
  const [proposals, pollsData, mkrInChief, skyExecutives, skyHatInfo] = responses.map(promise =>
    promise.status === 'fulfilled' ? promise.value : null
  );

  const skyExecutive = skyExecutives && Array.isArray(skyExecutives) && skyExecutives.length > 0 ? skyExecutives[0] : undefined;

  return {
    proposals: proposals ? (proposals as Proposal[]).filter(i => i.active) : [],
    skyExecutive,
    skyHatInfo: skyHatInfo as { hatAddress: string; skyOnHat: string } | undefined,
    polls: pollsData ? (pollsData as PollsPaginatedResponse).polls : [],
    pollStats: pollsData ? (pollsData as PollsPaginatedResponse).stats : { active: 0, finished: 0, total: 0 },
    pollTags: pollsData ? (pollsData as PollsPaginatedResponse).tags : [],
    mkrInChief: mkrInChief ? formatValue(mkrInChief as bigint) : undefined
  };
}
