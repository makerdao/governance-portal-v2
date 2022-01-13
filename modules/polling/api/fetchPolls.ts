import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import getMaker from 'lib/maker';
import { markdownToHtml } from 'lib/utils';
import invariant from 'tiny-invariant';
import { Poll, PollCategory, PollVoteType } from 'modules/polling/types';
import mockPolls from './mocks/polls.json';
import { parsePollsMetadata } from './parsePollMetadata';
import { SupportedNetworks } from 'lib/constants';
import { getCategories } from '../helpers/getCategories';
import { isActivePoll } from '../helpers/utils';
import { PollFilters, PollsResponse } from '../types/pollsResponse';

// Returns all the polls and caches them in the file system.
export async function _getAllPolls(network?: SupportedNetworks): Promise<Poll[]> {
  const maker = await getMaker(network);
  const cacheKey = 'polls';

  if (config.USE_FS_CACHE) {
    const cachedPolls = fsCacheGet(cacheKey, network);
    if (cachedPolls) {
      return JSON.parse(cachedPolls);
    }
  } else if (config.NEXT_PUBLIC_USE_MOCK) {
    return mockPolls.map(p => ({
      ...p,
      voteType: p.voteType as PollVoteType,
      startDate: new Date(p.startDate),
      endDate: new Date(p.endDate)
    }));
  }
  const pollList = await maker.service('govPolling').getAllWhitelistedPolls();
  const polls = await parsePollsMetadata(pollList);

  if (config.USE_FS_CACHE) {
    fsCacheSet(cacheKey, JSON.stringify(polls), network);
  }
  return polls;
}

// Public method that returns the polls, and accepts filters
const defaultFilters: PollFilters = {
  startDate: null,
  endDate: null,
  categories: null,
  active: null
};

export async function getPolls(
  filters = defaultFilters,
  network?: SupportedNetworks
): Promise<PollsResponse> {
  const allPolls = await _getAllPolls(network);
  const filteredPolls = allPolls.filter(poll => {
    // check date filters first
    if (filters.startDate && new Date(poll.endDate).getTime() < filters.startDate.getTime()) return false;
    if (filters.endDate && new Date(poll.endDate).getTime() > filters.endDate.getTime()) return false;

    // if no category filters selected, return all, otherwise, check if poll contains category
    return (
      !filters.categories || poll.categories.some(c => filters.categories && filters.categories.includes(c))
    );
  });

  return {
    polls: filteredPolls,
    categories: getCategories(allPolls),
    stats: {
      active: allPolls.filter(isActivePoll).length,
      finished: allPolls.filter(p => !isActivePoll(p)).length,
      total: allPolls.length
    }
  };
}

export async function getPoll(slug: string, network?: SupportedNetworks): Promise<Poll | null> {
  const pollsResponse = await getPolls({}, network);

  const pollIndex = pollsResponse.polls.findIndex(poll => poll.slug === slug);

  if (pollIndex === -1) {
    return null;
  }

  const [prev, next] = [
    pollsResponse.polls?.[pollIndex - 1] || null,
    pollsResponse.polls?.[pollIndex + 1] || null
  ];

  return {
    ...pollsResponse.polls[pollIndex],
    content: await markdownToHtml(pollsResponse.polls[pollIndex].content),
    ctx: {
      prev,
      next
    }
  };
}

export async function getPollById(pollId: number, network?: SupportedNetworks): Promise<Poll> {
  const pollsResponse = await getPolls({}, network);

  const pollIndex = pollsResponse.polls.findIndex(poll => poll.pollId === pollId);
  invariant(pollIndex > -1, `poll not found for poll id ${pollId}`);
  const [prev, next] = [
    pollsResponse.polls?.[pollIndex - 1] || null,
    pollsResponse.polls?.[pollIndex + 1] || null
  ];

  return {
    ...pollsResponse.polls[pollIndex],
    content: await markdownToHtml(pollsResponse.polls[pollIndex].content),
    ctx: {
      prev,
      next
    }
  };
}

export async function getPollCategories(): Promise<PollCategory[]> {
  const pollsResponse = await getPolls();
  const categories = getCategories(pollsResponse.polls);

  return categories;
}
