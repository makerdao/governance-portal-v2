/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { cacheGet, cacheSet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Poll, PollListItem } from '../types';
import { pollDetailsCacheKey, pollListCacheKey } from 'modules/cache/constants/cache-keys';
import { refetchPolls } from './fetchPolls';
import { ONE_WEEK_IN_MS } from 'modules/app/constants/time';
import { matterWrapper } from 'lib/matter';
import { markdownToHtml } from 'lib/markdown';
import { getPollTags } from './getPollTags';

export async function fetchSinglePoll(
  network: SupportedNetworks,
  pollIdOrSlug: number | string
): Promise<Poll | null> {
  if (!pollIdOrSlug) {
    return null;
  }

  const pollListString = await cacheGet(pollListCacheKey, network, ONE_WEEK_IN_MS);
  let pollList: PollListItem[] = [];

  if (pollListString) {
    pollList = JSON.parse(pollListString);
  } else {
    const { pollList: refetchedPollList } = await refetchPolls(network);
    pollList = refetchedPollList;
  }

  const parsedPollIdentifier = typeof pollIdOrSlug === 'number' ? pollIdOrSlug : parseInt(pollIdOrSlug);
  // If it's a number, the parameter passed is a pollId. If not, it's a pollSlug
  const pollId: number | null = !Number.isNaN(parsedPollIdentifier)
    ? parsedPollIdentifier
    : pollList.find(p => p.slug === pollIdOrSlug)?.pollId || null;

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
