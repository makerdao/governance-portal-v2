import { cacheGet, cacheSet } from 'modules/cache/cache';
import { markdownToHtml } from 'lib/markdown';
import { QueryFilterNames } from 'modules/gql/gql.constants';
import { getQueryFilter } from 'modules/gql/gqlFilters';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { spockPollToPartialPoll } from '../helpers/parsePollMetadata';
import { Poll } from '../types';
import { PollSpock } from '../types/pollSpock';
import { fetchPollMetadata } from './fetchPollMetadata';
import { fetchSpockPolls } from './fetchPolls';
import { getPollTagsMapping } from './getPollTags';

export async function fetchSpockPollById(
  pollId: number,
  network: SupportedNetworks
): Promise<PollSpock | undefined> {
  const filter = getQueryFilter(QueryFilterNames.PollId, { pollId });
  const [poll] = await fetchSpockPolls(network, filter);
  return poll as PollSpock;
}

export async function fetchSpockPollBySlug(slug: string, network: SupportedNetworks): Promise<PollSpock> {
  const filter = getQueryFilter(QueryFilterNames.MultiHash, { multiHash: slug });
  const [poll] = await fetchSpockPolls(network, filter);
  return poll as PollSpock;
}

export async function fetchPollById(pollId: number, network: SupportedNetworks): Promise<Poll | null> {
  const cacheKey = `poll_${pollId}`;

  const cachedPoll = await cacheGet(cacheKey, network);
  if (cachedPoll) {
    return JSON.parse(cachedPoll);
  }

  const data = await fetchSpockPollById(pollId, network);

  if (!data) {
    return null;
  }

  const tagsMapping = await getPollTagsMapping();

  const parsedPoll = await fetchPollMetadata(spockPollToPartialPoll(data), tagsMapping);
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

    cacheSet(cacheKey, JSON.stringify(poll), network);

    return poll;
  }

  return null;
}

export async function fetchPollBySlug(slug: string, network: SupportedNetworks): Promise<Poll | null> {
  const cacheKey = `poll_${slug}`;
  const cachedPoll = await cacheGet(cacheKey, network);
  if (cachedPoll) {
    return JSON.parse(cachedPoll);
  }

  const data = await fetchSpockPollBySlug(slug, network);

  if (!data) {
    return null;
  }

  const tagsMapping = await getPollTagsMapping();

  const parsedPoll = await fetchPollMetadata(spockPollToPartialPoll(data), tagsMapping);

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

    cacheSet(cacheKey, JSON.stringify(poll), network);

    return poll;
  }

  return null;
}
