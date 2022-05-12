import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { markdownToHtml } from 'lib/markdown';
import { QueryFilterNames } from 'modules/gql/gql.constants';
import { getQueryFilter } from 'modules/gql/gqlFilters';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { spockPollToPartialPoll } from '../helpers/parsePollMetadata';
import { Poll } from '../types';
import { PollSpock } from '../types/pollSpock';
import { fetchPollMetadata } from './fetchPollMetadata';
import { fetchSpockPolls } from './fetchPolls';

export async function fetchSpockPollById(
  pollId: number,
  network: SupportedNetworks
): Promise<PollSpock | undefined> {
  const filter = getQueryFilter(QueryFilterNames.PollId, pollId);
  const [poll] = await fetchSpockPolls(network, filter);
  return poll as PollSpock;
}

export async function fetchSpockPollBySlug(slug: string, network: SupportedNetworks): Promise<PollSpock> {
  const filter = getQueryFilter(QueryFilterNames.MultiHash, slug);
  const [poll] = await fetchSpockPolls(network, filter);
  return poll as PollSpock;
}

export async function fetchPollById(pollId: number, network: SupportedNetworks): Promise<Poll | null> {
  const cacheKey = `poll_${pollId}`;

  if (config.USE_FS_CACHE) {
    const cachedPoll = fsCacheGet(cacheKey, network);
    if (cachedPoll) {
      return JSON.parse(cachedPoll);
    }
  }

  const data = await fetchSpockPollById(pollId, network);

  if (!data) {
    return null;
  }

  const parsedPoll = await fetchPollMetadata(spockPollToPartialPoll(data));
  if (parsedPoll) {
    const prev = await fetchSpockPollById(pollId - 1, network);

    const next = await fetchSpockPollById(pollId + 1, network);

    const poll = {
      ...parsedPoll,
      content: await markdownToHtml(parsedPoll.content),
      ctx: {
        prev: prev ? spockPollToPartialPoll(prev) : null,
        next: next ? spockPollToPartialPoll(next) : null
      }
    };

    if (config.USE_FS_CACHE) {
      fsCacheSet(cacheKey, JSON.stringify(poll), network);
    }

    return poll;
  }

  return null;
}

export async function fetchPollBySlug(slug: string, network: SupportedNetworks): Promise<Poll | null> {
  const cacheKey = `poll_${slug}`;

  if (config.USE_FS_CACHE) {
    const cachedPoll = fsCacheGet(cacheKey, network);
    if (cachedPoll) {
      return JSON.parse(cachedPoll);
    }
  }

  const data = await fetchSpockPollBySlug(slug, network);

  if (!data) {
    return null;
  }

  const parsedPoll = await fetchPollMetadata(spockPollToPartialPoll(data));

  if (parsedPoll) {
    const prev = await fetchSpockPollById(parsedPoll.pollId - 1, network);

    const next = await fetchSpockPollById(parsedPoll.pollId + 1, network);

    const poll = {
      ...parsedPoll,
      content: await markdownToHtml(parsedPoll.content),
      ctx: {
        prev: prev ? spockPollToPartialPoll(prev) : null,
        next: next ? spockPollToPartialPoll(next) : null
      }
    };

    if (config.USE_FS_CACHE) {
      fsCacheSet(cacheKey, JSON.stringify(poll), network);
    }

    return poll;
  }

  return null;
}
