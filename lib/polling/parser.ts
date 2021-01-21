import matter from 'gray-matter';
import validUrl from 'valid-url';
import Poll, { PartialPoll } from '../../types/poll';
import VoteTypes from '../../types/voteTypes';
import { POLL_CATEGORIZATION_ENDPOINT } from '../constants';
import { fetchJson } from '../utils';

type CategoryMap = Record<string, string[]>;
let categoryMapCache;

export async function fetchCategoryMap(): Promise<CategoryMap> {
  if (!categoryMapCache) {
    categoryMapCache = await fetchJson(POLL_CATEGORIZATION_ENDPOINT);
  }
  return categoryMapCache;
}

export function parsePollMetadata(poll: PartialPoll, document: string, categoryMap?: CategoryMap): Poll {
  const { data: pollMeta, content } = matter(document);
  const summary = pollMeta?.summary || '';
  const title = pollMeta?.title || '';
  const options = pollMeta.options;
  const discussionLink =
    pollMeta?.discussion_link && validUrl.isUri(pollMeta.discussion_link) ? pollMeta.discussion_link : null;
  const voteType: VoteTypes = (pollMeta as { vote_type: VoteTypes | null })?.vote_type || 'Plurality Voting'; // compiler error if invalid vote type

  const categories = [
    ...(pollMeta?.categories || []),
    ...(pollMeta?.category ? [pollMeta?.category] : []),
    ...(categoryMap?.[poll.pollId] || [])
  ];
  return {
    ...poll,
    slug: poll.multiHash.slice(0, 8),
    startDate: `${poll.startDate}`,
    endDate: `${poll.endDate}`,
    content,
    summary,
    title,
    options,
    discussionLink,
    voteType,
    categories: categories.length > 0 ? categories : ['Uncategorized']
  };
}
