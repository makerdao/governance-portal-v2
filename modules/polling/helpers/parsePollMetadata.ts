import matter from 'gray-matter';
import validUrl from 'valid-url';
import { Poll, PartialPoll, PollVoteType } from 'modules/polling/types';
import { POLL_VOTE_TYPE } from '../polling.constants';
import { PollSpock } from '../types/pollSpock';
import { getPollTags, getPollTagsMapping } from '../api/getPollTags';

export function spockPollToPartialPoll(poll: PollSpock): PartialPoll {
  const formatted: PartialPoll = {
    ...poll,
    slug: poll.multiHash.slice(0, 8),
    startDate: new Date(poll.startDate * 1000),
    endDate: new Date(poll.endDate * 1000)
  };
  return formatted;
}

export function parsePollMetadata(poll: PartialPoll, document: string): Poll {
  const { data: pollMeta, content } = matter(document);
  const summary = pollMeta?.summary || '';
  const title = pollMeta?.title || '';
  const options = pollMeta.options;
  const discussionLink =
    pollMeta?.discussion_link && validUrl.isUri(pollMeta.discussion_link) ? pollMeta.discussion_link : null;
  const voteType: PollVoteType =
    (pollMeta as { vote_type: PollVoteType | null })?.vote_type || POLL_VOTE_TYPE.UNKNOWN; // compiler error if invalid vote type

  const tags = getPollTags();
  const mapping = getPollTagsMapping();

  const pollTags = mapping[poll.pollId] || [];

  let startDate, endDate;
  //poll coming from poll create page
  if (poll.startDate.getTime() === 0 && poll.endDate.getTime() === 0) {
    startDate = pollMeta.start_date;
    endDate = pollMeta.end_date;
  } else {
    //poll coming from onchain
    startDate = poll.startDate;
    endDate = poll.endDate;
  }

  return {
    ...poll,
    startDate,
    endDate,
    content,
    summary,
    title,
    options,
    discussionLink,
    voteType,
    tags: pollTags.map(p => tags.find(t => t.id === p)).filter(p => !!p),
    ctx: { prev: null, next: null }
  };
}
