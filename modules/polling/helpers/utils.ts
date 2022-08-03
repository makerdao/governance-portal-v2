import { PollInputFormat, PollResultDisplay, PollVictoryConditions } from '../polling.constants';
import { Poll, PollParameters, PollVictoryConditionAND, PollVote, VictoryCondition } from '../types';

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
  victoryConditions: (PollVictoryConditionAND | VictoryCondition)[],
  victoryCondition: PollVictoryConditions
): boolean {
  return !!victoryConditions.find((v: VictoryCondition | PollVictoryConditionAND) => {
    if (v.type === PollVictoryConditions.and) {
      if (victoryCondition === PollVictoryConditions.and) {
        return true;
      }

      return !!(v.conditions || []).find(i => i.type === victoryCondition);
    }

    return v.type === victoryCondition;
  });
}

export function hasVictoryConditionInstantRunOff(
  victoryConditions: (PollVictoryConditionAND | VictoryCondition)[]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.instantRunoff);
}
export function hasVictoryConditionPlurality(
  victoryConditions: (PollVictoryConditionAND | VictoryCondition)[]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.plurality);
}

export function hasVictoryConditionMajority(
  victoryConditions: (PollVictoryConditionAND | VictoryCondition)[]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.majority);
}

export function hasVictoryConditionApproval(
  victoryConditions: (PollVictoryConditionAND | VictoryCondition)[]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.approval);
}

export function hasVictoryConditionAND(
  victoryConditions: (PollVictoryConditionAND | VictoryCondition)[]
): boolean {
  return findVictoryCondition(victoryConditions, PollVictoryConditions.and);
}

export function isResultDisplaySingleVoteBreakdown(parameters: PollParameters): boolean {
  return parameters.resultDisplay === PollResultDisplay.singleVoteBreakdown;
}

export function isResultDisplayInstantRunoffBreakdown(parameters: PollParameters): boolean {
  return parameters.resultDisplay === PollResultDisplay.instantRunoffBreakdown;
}

export function isResultDisplayApprovalBreakdown(parameters: PollParameters): boolean {
  return parameters.resultDisplay === PollResultDisplay.approvalBreakdown;
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
    return currentVote?.ballot !== undefined ? currentVote.ballot : null;
  } else if (isInputFormatSingleChoice(poll.parameters)) {
    return currentVote?.optionId !== undefined ? currentVote.optionId : null;
  }

  return null;
}

export function findPollById(pollList: Poll[], pollId: string): Poll | undefined {
  return pollList.find((poll: Poll) => parseInt(pollId) === poll.pollId);
}
