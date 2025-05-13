/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { cacheGet, cacheSet } from 'modules/cache/cache';
import { PartialActivePoll, PollFilterQueryParams, PollListItem, SubgraphPoll } from 'modules/polling/types';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { PollsPaginatedResponse } from '../types/pollsResponse';
import { PollsValidatedQueryParams } from 'modules/polling/types';
import { partialActivePollsCacheKey, pollListCacheKey } from 'modules/cache/constants/cache-keys';
import { getPollTags, getPollTagsMapping } from './getPollTags';
import { AGGREGATED_POLLS_FILE_URL, PollStatusEnum, PollInputFormat } from '../polling.constants';
import { ONE_WEEK_IN_MS } from 'modules/app/constants/time';
import { sortPollsBy } from '../helpers/sortPolls';
import { TagCount } from 'modules/app/types/tag';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { SupportedChainId } from 'modules/web3/constants/chainID';
import {
  arbitrumPollsQuery,
  arbitrumPollsQueryWithWhitelist
} from 'modules/gql/queries/subgraph/arbitrumPolls';
import { POLL_CREATOR_WHITELIST } from '../polling.constants';
import logger from 'lib/logger';

export async function refetchPolls(network: SupportedNetworks): Promise<{
  pollList: PollListItem[];
  partialActivePolls: PartialActivePoll[];
}> {
  const arbitrumChainId =
    network === SupportedNetworks.MAINNET ? SupportedChainId.ARBITRUM : SupportedChainId.ARBITRUMTESTNET;

  const subgraphPolls: SubgraphPoll[] = [];
  let refetchSubgraph = true;
  let skip = 0;
  while (refetchSubgraph) {
    const response = await gqlRequest<Promise<{ arbitrumPolls: SubgraphPoll[] }>>({
      chainId: arbitrumChainId,
      query: network === SupportedNetworks.MAINNET && process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development' ? arbitrumPollsQueryWithWhitelist : arbitrumPollsQuery,
      variables:
        network === SupportedNetworks.MAINNET && process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development'
          ? { argsSkip: skip, creatorWhitelist: POLL_CREATOR_WHITELIST }
          : { argsSkip: skip }
    });

    if (response.arbitrumPolls.length === 0) {
      refetchSubgraph = false;
    } else {
      skip += 1000;
      subgraphPolls.push(...response.arbitrumPolls);
    }
  }

  const [pollsMetadataRes, pollTagsMapping] = await Promise.all([
    fetch(AGGREGATED_POLLS_FILE_URL[network]),
    getPollTagsMapping()
  ]);

  // Check if fetching polls metadata was successful
  if (!pollsMetadataRes.ok) {
    logger.error(
      `refetchPolls: Failed to fetch aggregated polls file. Status: ${pollsMetadataRes.status} ${pollsMetadataRes.statusText}`,
      'Network',
      network
    );
    return { pollList: [], partialActivePolls: [] };
  }

  let pollsMetadata;
  try {
    // Attempt to parse the JSON response for polls metadata
    pollsMetadata = await pollsMetadataRes.json();
  } catch (jsonError: any) {
    logger.error(
      'refetchPolls: Failed to parse aggregated polls JSON.',
      jsonError.message,
      'Network',
      network
    );
    return { pollList: [], partialActivePolls: [] };
  }

  const pollList: PollListItem[] = subgraphPolls
    .map(poll => {
      const { id, url, multiHash } = poll;

      const foundPollMetadata = pollsMetadata.find(entry => {
        // Decode both paths before comparing
        const decodedUrlPath = decodeURIComponent(url);
        const decodedMetadataPath = decodeURIComponent(entry.path);
        return decodedUrlPath.includes(decodedMetadataPath);
      });

      if (!foundPollMetadata) {
        return;
      }

      const { metadata } = foundPollMetadata;

      return {
        pollId: parseInt(id),
        startDate: new Date(metadata.start_date).toISOString(),
        endDate: new Date(metadata.end_date).toISOString(),
        multiHash,
        slug: multiHash.slice(0, 8),
        url,
        discussionLink: metadata.discussion_link,
        type: metadata.parameters.input_format.type,
        parameters: {
          inputFormat: metadata.parameters.input_format,
          resultDisplay: metadata.parameters.result_display,
          victoryConditions: metadata.parameters.victory_conditions
        },
        title: metadata.title,
        summary: metadata.summary,
        options: metadata.options,
        tags: pollTagsMapping[parseInt(id)] || []
      };
    })
    .filter(poll => !!poll);

  const partialActivePolls = pollList
    .filter(poll => new Date(poll.endDate) > new Date())
    .map(({ pollId, startDate, endDate }) => ({
      pollId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    }));

  cacheSet(pollListCacheKey, JSON.stringify(pollList), network, ONE_WEEK_IN_MS);
  cacheSet(partialActivePollsCacheKey, JSON.stringify(partialActivePolls), network, ONE_WEEK_IN_MS);

  return { pollList, partialActivePolls };
}

export async function getActivePollIds(network: SupportedNetworks): Promise<number[]> {
  let partialActivePolls: PartialActivePoll[] | undefined;

  const cachedPartialActivePolls = await cacheGet(partialActivePollsCacheKey, network, ONE_WEEK_IN_MS);
  if (cachedPartialActivePolls) {
    partialActivePolls = JSON.parse(cachedPartialActivePolls);
  } else {
    const { partialActivePolls: newPartialActivePolls } = await refetchPolls(network);
    partialActivePolls = newPartialActivePolls;
  }

  const activePollIds =
    partialActivePolls
      ?.filter(poll => new Date(poll.endDate) > new Date() && new Date(poll.startDate) <= new Date())
      .map(poll => poll.pollId) || [];

  return activePollIds;
}

export async function getPollList(network: SupportedNetworks): Promise<PollListItem[]> {
  const cachedPollList = await cacheGet(pollListCacheKey, network, ONE_WEEK_IN_MS);
  if (cachedPollList) {
    return JSON.parse(cachedPollList);
  }

  const { pollList } = await refetchPolls(network);
  return pollList;
}

export function filterPollList(
  pollList: PollListItem[],
  filters: PollFilterQueryParams
): Omit<PollsPaginatedResponse, 'tags'> {
  const {
    pageSize,
    page,
    title: filterTitle,
    orderBy,
    tags: filterTags,
    status,
    type: filterTypes,
    startDate: filterStartDate,
    endDate: filterEndDate
  } = filters;

  const filteredPolls = pollList
    // First, filter the poll list by the filters passed
    .filter(({ title, tags, type, startDate, endDate }) => {
      const paramStartDate = new Date(startDate);
      const paramEndDate = new Date(endDate);

      return (
        new Date() >= paramStartDate &&
        (filterTitle ? title.toLowerCase().includes(filterTitle.toLowerCase()) : true) &&
        (filterTags ? filterTags.every(tag => tags.includes(tag)) : true) &&
        (filterStartDate ? paramStartDate >= filterStartDate : true) &&
        (filterEndDate ? paramEndDate < filterEndDate : true) &&
        (status
          ? status === PollStatusEnum.active
            ? new Date() < paramEndDate
            : new Date() >= paramEndDate
          : true) &&
        (filterTypes ? filterTypes.includes(type) : true)
      );
    });

  const sortedPolls = filteredPolls
    // Then, sort it by the `orderBy` parameter
    .sort(sortPollsBy(orderBy));

  const totalCount = filteredPolls.length;
  const numPages = Math.ceil(filteredPolls.length / pageSize);
  const hasNextPage = page < numPages;

  const pollStats = {
    active: 0,
    finished: 0,
    total: filteredPolls.length,
    type: {
      [PollInputFormat.singleChoice]: 0,
      [PollInputFormat.rankFree]: 0,
      [PollInputFormat.majority]: 0,
      [PollInputFormat.chooseFree]: 0
    }
  };

  // If the only filter applied is the poll status (active or finished), use all polls for counts.
  // Else, use only the filtered polls
  const onlyStatusFiltered =
    status && !filterTitle && !filterTags && !filterTypes && !filterStartDate && !filterEndDate;

  const pollsToCount = onlyStatusFiltered ? pollList : filteredPolls;

  pollsToCount.forEach(poll => {
    if (new Date(poll.endDate) > new Date() && new Date(poll.startDate) <= new Date()) {
      pollStats.active++;
    } else {
      pollStats.finished++;
    }

    switch (poll.type) {
      case PollInputFormat.singleChoice:
        pollStats.type[PollInputFormat.singleChoice]++;
        break;
      case PollInputFormat.rankFree:
        pollStats.type[PollInputFormat.rankFree]++;
        break;
      case PollInputFormat.chooseFree:
        pollStats.type[PollInputFormat.chooseFree]++;
        break;
      case PollInputFormat.majority:
        pollStats.type[PollInputFormat.majority]++;
        break;
      default:
        break;
    }
  });

  return {
    paginationInfo: {
      totalCount,
      page,
      numPages,
      hasNextPage
    },
    stats: pollStats,
    polls: sortedPolls
  };
}

export function reducePollTags(pollList: PollListItem[], filteredPollList: PollListItem[]): TagCount[] {
  const pollTags = getPollTags();

  const tags = pollList.reduce((acumTags, poll) => {
    const pollInFilteredPolls = filteredPollList.some(p => p.pollId === poll.pollId);

    poll.tags.forEach(tag => {
      const addedTag = acumTags.find(t => t.id === tag);

      if (addedTag) {
        if (pollInFilteredPolls) {
          addedTag.count += 1;
        }
        return;
      }

      const pollTag = pollTags.find(t => t.id === tag);

      if (pollTag) {
        acumTags.push({
          ...pollTag,
          count: pollInFilteredPolls ? 1 : 0
        });
      }
    });

    return acumTags;
  }, [] as TagCount[]);

  return tags.sort((a, b) => (a.longname > b.longname ? 1 : -1));
}

export async function getPollsPaginated({
  network,
  pageSize,
  page,
  title,
  orderBy,
  tags,
  status,
  type,
  startDate,
  endDate
}: PollsValidatedQueryParams): Promise<PollsPaginatedResponse> {
  const pollList = await getPollList(network);

  const pollFilters = { pageSize, page, title, orderBy, tags, status, type, startDate, endDate };
  const filteredPollList = filterPollList(pollList, pollFilters);
  const pollTags = reducePollTags(pollList, filteredPollList.polls);

  return {
    ...filteredPollList,
    polls: filteredPollList.polls.slice((page - 1) * pageSize, page * pageSize),
    tags: pollTags
  };
}
