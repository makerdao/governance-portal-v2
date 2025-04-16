/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Poll, PollListItem } from '../types';
import {
  pollDetailsCacheKey,
  pollListCacheKey,
  pollSlugToIdsCacheKey
} from 'modules/cache/constants/cache-keys';
import { refetchPolls } from './fetchPolls';
import { ONE_WEEK_IN_MS } from 'modules/app/constants/time';
import { matterWrapper } from 'lib/matter';
import { markdownToHtml } from 'lib/markdown';
import { getPollTags } from './getPollTags';

const fetchPollListsFromCache = async (network: SupportedNetworks) =>
  await Promise.all([
    cacheGet(pollListCacheKey, network, ONE_WEEK_IN_MS),
    cacheGet(pollSlugToIdsCacheKey, network, ONE_WEEK_IN_MS)
  ]);

export async function fetchSinglePoll(
  network: SupportedNetworks,
  pollIdOrSlug: number | string
): Promise<Poll | null> {
  if (!pollIdOrSlug) {
    return null;
  }

  let [pollListString, pollSlugToIdsString] = await fetchPollListsFromCache(network);

  if (!pollListString || !pollSlugToIdsString) {
    await refetchPolls(network);
    // If not found, fetch them again after refetching all polls
    [pollListString, pollSlugToIdsString] = await fetchPollListsFromCache(network);
  }

  const pollList: PollListItem[] = JSON.parse(pollListString);
  const pollSlugToIds = JSON.parse(pollSlugToIdsString);

  const parsedPollIdentifier = typeof pollIdOrSlug === 'number' ? pollIdOrSlug : parseInt(pollIdOrSlug);
  // If it's a number, the parameter passed is a pollId. If not, it's a pollSlug
  const pollId: number | null = !Number.isNaN(parsedPollIdentifier)
    ? parsedPollIdentifier
    : pollSlugToIds.find(p => p[0] === pollIdOrSlug)?.[1] || null;

  if (!pollId) {
    return null;
  }

  const cachedPoll = await cacheGet(pollDetailsCacheKey, network, ONE_WEEK_IN_MS, 'HGET', String(pollId));
  if (cachedPoll) {
    return JSON.parse(cachedPoll);
  }

  // If poll is not cached, fetch individual poll
  const pollInListIndex = pollList.findIndex(entry => entry.pollId === pollId);
  const pollInList = pollList[pollInListIndex];
  if (!pollInList) {
    return null;
  }

  const pollMdDoc = await (await fetch(pollInList.url)).text();

  const { content } = matterWrapper(pollMdDoc);
  const html = await markdownToHtml(content);

  const pollTags = getPollTags();
  const prevSlug = pollList[pollInListIndex - 1]?.slug;
  const nextSlug = pollList[pollInListIndex + 1]?.slug;

  const poll = {
    ...pollInList,
    startDate: new Date(pollInList.startDate),
    endDate: new Date(pollInList.endDate),
    content: html,
    tags: pollInList.tags.map(tag => pollTags.find(pollTag => pollTag.id === tag)).filter(tag => !!tag),
    ctx: {
      prev: prevSlug
        ? {
            slug: prevSlug
          }
        : null,
      next: nextSlug
        ? {
            slug: nextSlug
          }
        : null
    }
  };

  // Individual polls contain more metadata than the poll-list array and are used to render the poll detail page.
  // They are stored as multiple hashes for a same cache key for improved performance when setting and getting them.
  cacheSet(
    pollDetailsCacheKey,
    JSON.stringify(poll),
    network,
    ONE_WEEK_IN_MS,
    'HSET',
    poll.pollId.toString()
  );

  return poll;
}
