import { config } from 'lib/config';
import { fsCacheGet, fsCacheSet } from 'lib/fscache';
import { Poll, PollCategory, PollVoteType } from 'modules/polling/types';
import mockPolls from './mocks/polls.json';
import { fetchPollMetadata } from './fetchPollMetadata';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import { getCategories } from '../helpers/getCategories';
import { isActivePoll } from '../helpers/utils';
import { PollFilters, PollsResponse } from '../types/pollsResponse';
import { allWhitelistedPolls } from 'modules/gql/queries/allWhitelistedPolls';
import { gqlRequest } from 'modules/gql/gqlRequest';
import { networkNameToChainId } from 'modules/web3/helpers/chain';
import { PollSpock } from '../types/pollSpock';
import uniqBy from 'lodash/uniqBy';
import chunk from 'lodash/chunk';
import { spockPollToPartialPoll } from '../helpers/parsePollMetadata';

export function sortPolls(pollList: Poll[]): Poll[] {
  return pollList.sort((a, b) => {
    // closest to expiration shown first, if some have same expiration date, sort by startdate
    const dateEndDiff = a.endDate.getTime() - b.endDate.getTime();

    // Sort by more recent first if they end at the same time
    const sortedByStartDate = a.startDate.getTime() < b.startDate.getTime() ? 1 : -1;

    return dateEndDiff < 0 ? 1 : dateEndDiff > 0 ? -1 : sortedByStartDate;
  });
}

// Fetches all the polls metadata, sorts and filters results.
export async function fetchAllPollsMetadata(pollList: PollSpock[]): Promise<Poll[]> {
  let numFailedFetches = 0;
  const failedPollIds: number[] = [];
  const polls: Poll[] = [];

  //uniqBy keeps the first occurence of a duplicate, so we sort polls so that the most recent poll is kept in case of a duplicate
  const dedupedPolls = uniqBy(
    pollList.sort((a, b) => b.pollId - a.pollId),
    p => p.multiHash
  );

  for (const pollGroup of chunk(dedupedPolls, 20)) {
    // fetch polls in batches, don't fetch a new batch until the current one has resolved
    const pollGroupWithData = await Promise.all(
      pollGroup.map(async (p: PollSpock) => {
        try {
          return await fetchPollMetadata(spockPollToPartialPoll(p));
        } catch (err) {
          numFailedFetches += 1;
          failedPollIds.push(p.pollId);
          return null;
        }
      })
    ).then((polls: Poll[]) => polls.filter(poll => !!poll));

    polls.push(...pollGroupWithData);
  }

  console.log(
    `---
    Failed to fetch docs for ${numFailedFetches}/${pollList.length} polls.
    IDs: ${failedPollIds}`
  );

  return sortPolls(polls);
}

export async function fetchAllSpockPolls(network: SupportedNetworks): Promise<PollSpock[]> {
  const data = await gqlRequest({
    chainId: networkNameToChainId(network),
    query: allWhitelistedPolls
  });

  const pollList: PollSpock[] = data.activePolls.nodes;
  return pollList;
}

// Returns all the polls and caches them in the file system.
export async function _getAllPolls(network?: SupportedNetworks): Promise<Poll[]> {
  const cacheKey = 'polls';

  if (config.USE_FS_CACHE) {
    const cachedPolls = fsCacheGet(cacheKey, network);
    if (cachedPolls) {
      return JSON.parse(cachedPolls);
    }
  }

  const pollList = await fetchAllSpockPolls(network || DEFAULT_NETWORK.network);

  const polls = await fetchAllPollsMetadata(pollList);

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

export async function getPollCategories(): Promise<PollCategory[]> {
  const pollsResponse = await getPolls();
  const categories = getCategories(pollsResponse.polls);

  return categories;
}
