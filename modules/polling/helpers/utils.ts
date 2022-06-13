import { PollInputFormat, PollVictoryConditions } from '../polling.constants';
import { Poll, PollParameters, PollVote } from '../types';

export function isActivePoll(poll: Poll): boolean {
  const now = Date.now();
  if (new Date(poll.endDate).getTime() < now) return false;
  if (new Date(poll.startDate).getTime() > now) return false;
  return true;
}

export function isRankedChoiceVictoryConditionPoll(parameters: PollParameters): boolean {
  return !!parameters.victoryConditions.find(v => v.type === PollVictoryConditions.instantRunoff);
}
export function isPluralityVictoryConditionPoll(parameters: PollParameters): boolean {
  return !!parameters.victoryConditions.find(v => v.type === PollVictoryConditions.plurality);
}

export function extractCurrentPollVote(
  poll: Poll,
  allUserVotes: PollVote[] | undefined
): number[] | number | null {
  const currentVote = allUserVotes?.find(_poll => _poll.pollId === poll.pollId);

  if (poll.parameters.inputFormat === PollInputFormat.rankFree) {
    return currentVote?.rankedChoiceOption !== undefined ? currentVote.rankedChoiceOption : null;
  } else if (poll.parameters.inputFormat === PollInputFormat.singleChoice) {
    return currentVote?.optionId !== undefined ? currentVote.optionId : null;
  }

  return null;
}

export function findPollById(pollList: Poll[], pollId: string): Poll | undefined {
  return pollList.find((poll: Poll) => parseInt(pollId) === poll.pollId);
}
