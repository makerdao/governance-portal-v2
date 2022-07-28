import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from '../polling.constants';
import { NestedVictoryCondition, Poll, PollParameters, PollVote } from '../types';

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

// Generic function to determine if a victory condition exists in the nested array of victory conditions
export function findVictoryCondition(
  victoryConditions: NestedVictoryCondition[] | NestedVictoryCondition[][],
  victoryCondition: PollVictoryConditions
) {
  return !!(victoryConditions as Array<NestedVictoryCondition | NestedVictoryCondition[]>).find(
    (v: NestedVictoryCondition[] | NestedVictoryCondition) => {
      if (Array.isArray(v)) {
        return !!v.find(i => i.type === victoryCondition);
      }
      return v.type === victoryCondition;
    }
  );
}

export function hasVictoryConditionInstantRunOff(
  victoryConditions: NestedVictoryCondition[] | NestedVictoryCondition[][]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.instantRunoff);
}
export function hasVictoryConditionPlurality(
  victoryConditions: NestedVictoryCondition[] | NestedVictoryCondition[][]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.plurality);
}

export function hasVictoryConditionMajority(
  victoryConditions: NestedVictoryCondition[] | NestedVictoryCondition[][]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.majority);
}

export function hasVictoryConditionApproval(
  victoryConditions: NestedVictoryCondition[] | NestedVictoryCondition[][]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.approval);
}

export function isResultDisplaySingleVoteBreakdown(parameters: PollParameters): boolean {
  return parameters.resultDisplay === PollResultDisplay.singleVoteBreakdown;
}

export function isResultDisplayInstantRunoffBreakdown(parameters: PollParameters): boolean {
  return parameters.resultDisplay === PollResultDisplay.instantRunoffBreakdown;
}

export function isInputFormatRankFree(parameters: PollParameters): boolean {
  return parameters.inputFormat.type === PollInputFormat.rankFree;
}

export function isInputFormatChooseFree(parameters: PollParameters): boolean {
  return parameters.inputFormat.type === PollInputFormat.chooseFree;
}

export function isInputFormatSingleChoice(parameters: PollParameters): boolean {
  return parameters.inputFormat.type === PollInputFormat.singleChoice;
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
