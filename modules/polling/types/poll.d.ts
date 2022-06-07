import { Tag } from 'modules/app/types/tag';
import { PollVoteType } from './pollVoteType';

export enum PollInputFormat {
  singleChoice = 'single-choice',
  rankFree = 'rank-free',
}

export enum PollVictoryConditions {
  majority = 'majority',
  plurality = 'plurality'
}

//  { type : comparison, options: [0, 1, 4], comparator : '>=10000' }
export type PollVictoryConditionComparison = {
  type: 'comparison',
  options: number[],
  comparator: string
}
// { type : default, options : [2] }
export type PollVictoryConditionDefault = {
  type: 'default',
  options: number[]
}

// NOT SUPPORTED YET: { type : majority, options : [2] }
export type PollVictoryMajority = {
  type: 'majority',
  options: number[]
}


enum PollResultDisplay {
  singleVoteBreakdown = 'singleVoteBreakdown',
  instantRunoffBreakdown = 'instant-runoff-breakdown',
  conditionSummary = 'condition-summary'
}

type PollParameters = {
  inputFormat: PollInputFormat,
  victoryConditions: (PollVictoryConditionComparison|PollVictoryConditionDefault|PollVictoryMajority)[],
  resultDisplay: PollResultDisplay
}

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
