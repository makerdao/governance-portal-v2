import { Tag } from 'modules/app/types/tag';
import { PollVoteType } from './pollVoteType';

enum PollInputFormat {
  singleChoice = 'single-choice',
  rankFree = 'rank-free',
}

enum PollVictoryConditions {
  majority = 'majority',
  plurality = 'plurality'
}

enum PollResultDisplay {
  singleVoteBreakdown = 'singleVoteBreakdown',
  instantRunoffBreakdown = 'instant-runoff-breakdown',
  conditionSummary = 'condition-summary'
}

type PollMetadata = {
  inputFormat: PollInputFormat,
  victoryConditions: PollVictoryConditions,
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
  metadata: PollMetadata;
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
