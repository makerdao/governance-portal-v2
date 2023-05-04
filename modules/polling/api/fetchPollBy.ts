/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { cacheGet } from 'modules/cache/cache';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { Poll } from '../types';
import { pollDetailsCacheKey, pollSlugToIdsCacheKey } from 'modules/cache/constants/cache-keys';
import { checkCachedPollsValidity, refetchPolls } from './fetchPolls';
import { ONE_WEEK_IN_MS } from 'modules/app/constants/time';

export async function fetchSinglePoll(
  network: SupportedNetworks,
  paramPollId: number | null,
  pollSlug: string | null
): Promise<Poll | null> {
  if (!paramPollId && !pollSlug) {
    return null;
  }

  const { valid: cachedPollsAreValid, hash: githubHash } = await checkCachedPollsValidity(network);

  if (cachedPollsAreValid) {
    const pollSlugToIdsString = await cacheGet(pollSlugToIdsCacheKey, network, ONE_WEEK_IN_MS);

    if (!pollSlugToIdsString) {
      return null;
    }

    const pollSlugToIds = JSON.parse(pollSlugToIdsString);
    const pollId: number | null = paramPollId
      ? paramPollId
      : pollSlugToIds.find(p => p[0] === pollSlug)?.[1] || null;

    if (!pollId) {
      return null;
    }

    const cachedPoll = await cacheGet(pollDetailsCacheKey, network, ONE_WEEK_IN_MS, 'HGET', String(pollId));
    if (cachedPoll) {
      return JSON.parse(cachedPoll);
    }
  }

  const { allPolls } = await refetchPolls(network, githubHash as string);

  return allPolls.find(poll => (paramPollId ? poll.pollId === paramPollId : poll.slug === pollSlug)) || null;
}
