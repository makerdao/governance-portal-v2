import { Tag } from 'modules/app/types/tag';
import { PollResultDisplay, PollVictoryConditions } from '../polling.constants';
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

// { type : 'approval' }
export type PollVictoryConditionApproval = {
  type: PollVictoryConditions.approval;
};

export type NestedVictoryCondition =
  | PollVictoryConditionComparison
  | PollVictoryConditionDefault
  | PollVictoryConditionMajority
  | PollVictoryConditionApproval
  | PollVictoryConditionInstantRunoff
  | PollVictoryConditionPlurality;

type PollParameters = {
  inputFormat: {
    type: PollInputFormat;
    abstain: number[];
    options: number[];
  };
  victoryConditions: NestedVictoryCondition[] | NestedVictoryCondition[][];
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
