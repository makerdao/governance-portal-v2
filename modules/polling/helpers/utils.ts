import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from '../polling.constants';
import { Poll, PollParameters, PollVote } from '../types';

export function pollHasEnded(poll: Poll): boolean {
  const now = Date.now();
  return new Date(poll.endDate).getTime() < now;
}

export function pollHasStarted(poll: Poll): boolean {
  const now = Date.now();
  return new Date(poll.startDate).getTime() < now;
}

export function isActivePoll(poll: Poll): boolean {
  return !pollHasEnded(poll) && pollHasStarted(poll);
}

export function isRankedChoiceVictoryConditionPoll(parameters: PollParameters): boolean {
  return !!parameters.victoryConditions.find(v => v.type === PollVictoryConditions.instantRunoff);
}
export function isPluralityVictoryConditionPoll(parameters: PollParameters): boolean {
  return !!parameters.victoryConditions.find(v => v.type === PollVictoryConditions.plurality);
}

export function isResultDisplaySingleVoteBreakdown(parameters: PollParameters): boolean {
  return parameters.resultDisplay === PollResultDisplay.singleVoteBreakdown;
}

export function isResultDisplayInstantRunoffBreakdown(parameters: PollParameters): boolean {
  return parameters.resultDisplay === PollResultDisplay.instantRunoffBreakdown;
}

export function isInputFormatRankFree(parameters: PollParameters): boolean {
  return parameters.inputFormat === PollInputFormat.rankFree;
}

export function isInputFormatChooseFree(parameters: PollParameters): boolean {
  return parameters.inputFormat === PollInputFormat.chooseFree;
}

export function isInputFormatSingleChoice(parameters: PollParameters): boolean {
  return parameters.inputFormat === PollInputFormat.singleChoice;
}

export function extractCurrentPollVote(
  poll: Poll,
  allUserVotes: PollVote[] | undefined
): number[] | number | null {
  const currentVote = allUserVotes?.find(_poll => _poll.pollId === poll.pollId);

  if (isInputFormatRankFree(poll.parameters)) {
    return currentVote?.rankedChoiceOption !== undefined ? currentVote.rankedChoiceOption : null;
  } else if (isInputFormatSingleChoice(poll.parameters)) {
    return currentVote?.optionId !== undefined ? currentVote.optionId : null;
  }

  return null;
}

export function findPollById(pollList: Poll[], pollId: string): Poll | undefined {
  return pollList.find((poll: Poll) => parseInt(pollId) === poll.pollId);
}
