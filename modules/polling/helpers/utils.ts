import { POLL_VOTE_TYPE } from '../polling.constants';
import { Poll, PollVote } from '../types';
import { getNetwork } from 'lib/maker';

export function isActivePoll(poll: Poll): boolean {
  const now = Date.now();
  if (new Date(poll.endDate).getTime() < now) return false;
  if (new Date(poll.startDate).getTime() > now) return false;
  return true;
}

// if the poll has ended, always fetch its tally from the server's cache
export const getPollApiUrl = (poll: Poll): string =>
  !isActivePoll(poll)
    ? `/api/polling/tally/cache-no-revalidate/${poll.pollId}?network=${getNetwork()}&type=${poll.voteType}`
    : `/api/polling/tally/${poll.pollId}?network=${getNetwork()}&type=${poll.voteType}`;

export function isRankedChoicePoll(poll: Poll): boolean {
  return poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE;
}

export function extractCurrentPollVote(
  poll: Poll,
  allUserVotes: PollVote[] | undefined
): number[] | number | null {
  const currentVote = allUserVotes?.find(_poll => _poll.pollId === poll.pollId);

  if (poll.voteType === POLL_VOTE_TYPE.RANKED_VOTE) {
    return currentVote?.rankedChoiceOption !== undefined ? currentVote.rankedChoiceOption : null;
  } else if (poll.voteType === POLL_VOTE_TYPE.PLURALITY_VOTE) {
    return currentVote?.option !== undefined ? currentVote.option : null;
  }

  return null;
}

export function findPollById(pollList: Poll[], pollId: string): Poll | undefined {
  return pollList.find((poll: Poll) => parseInt(pollId) === poll.pollId);
}
