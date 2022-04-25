import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { markdownToHtml } from 'lib/markdown';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { activePollByMultihash, activePollById } from 'modules/gql/queries/activePollBy';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { spockPollToPartialPoll } from '../helpers/parsePollMetadata';
import { Poll } from '../types';
import { PollSpock } from '../types/pollSpock';
import { fetchPollMetadata } from './fetchPollMetadata';
import { fetchAllSpockPolls } from './fetchPolls';

export async function fetchSpockPollById(
  pollId: number,
  network: SupportedNetworks
): Promise<PollSpock | undefined> {
  const polls = await fetchAllSpockPolls(network);
  return polls.find(poll => poll.pollId === pollId);

  // TODO : this is the new query
  const data: PollSpock = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: activePollById,
    variables: {
      argPollId: pollId
    }
  });

  return data;
}

export async function fetchSpockPollBySlug(slug: string, network: SupportedNetworks): Promise<PollSpock> {
  const polls = await fetchAllSpockPolls(network);

  const pollIndex = polls.findIndex(poll => poll.multiHash.slice(0, 8) === slug);
  return polls[pollIndex] as PollSpock;

  // TODO : This is the new query
  const data: PollSpock = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: activePollByMultihash,
    variables: {
      argPollMultihash: `${slug}%`
    }
  });

  return data;
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
