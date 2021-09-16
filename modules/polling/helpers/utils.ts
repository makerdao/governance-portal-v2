import { POLL_VOTE_TYPE } from '../polls.constants';
import { Poll, PollVote } from '../types';

export function isActivePoll(poll: Poll): boolean {
  const now = Date.now();
  if (new Date(poll.endDate).getTime() < now) return false;
  if (new Date(poll.startDate).getTime() > now) return false;
  return true;
}

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
