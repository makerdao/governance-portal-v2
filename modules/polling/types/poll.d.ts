import { Tag } from 'modules/app/types/tag';
import { PollVictoryConditions } from '../polling.constants';
import { PollVoteType } from './pollVoteType';

//  { type : comparison, options: [0, 1, 4], comparator : '>=10000' }
export type PollVictoryConditionComparison = {
  type: PollVictoryConditions.comparison;
  options: number[];
  comparator: string;
};
// { type : default, options : [2] }
export type PollVictoryConditionDefault = {
  type: PollVictoryConditions.default;
  options: number[];
};

// NOT SUPPORTED YET: { type : majority, options : [2] }
export type PollVictoryConditionMajority = {
  type: PollVictoryConditions.majority;
  options: number[];
};

// { type : 'plurality' }
export type PollVictoryConditionPlurality = {
  type: PollVictoryConditions.plurality;
};

// { type : 'instant-runoff' }
export type PollVictoryConditionInstantRunoff = {
  type: PollVictoryConditions.instantRunoff;
};

enum PollResultDisplay {
  singleVoteBreakdown = 'singleVoteBreakdown',
  instantRunoffBreakdown = 'instant-runoff-breakdown',
  conditionSummary = 'condition-summary'
}

type PollParameters = {
  inputFormat: PollInputFormat;
  victoryConditions: (
    | PollVictoryConditionComparison
    | PollVictoryConditionDefault
    | PollVictoryConditionMajority
    | PollVictoryConditionInstantRunoff
    | PollVictoryConditionPlurality
  )[];
  resultDisplay: PollResultDisplay;
};

export type Poll = {
  title: string;
  multiHash: string;
  content: string;
  pollId: number;
  summary: string;
  options: Record<any, any>;
  endDate: Date;
  startDate: Date;
  discussionLink: string | null;
  voteType: PollVoteType;
  parameters: PollParameters;
  tags: Tag[];
  slug: string;
  ctx: {
    prev: PartialPoll | null;
    next: PartialPoll | null;
  };
  url?: string;
};

export type PartialPoll = {
  multiHash: string;
  pollId: number;
  slug: string;
  startDate: Date;
  endDate: Date;
  url: string;
};
