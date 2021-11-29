import { PollVoteType } from './pollVoteType';

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
  categories: string[];
  slug: string;
  ctx: {
    prev: Poll | null;
    next: Poll | null;
  };
  url?: string;
};

export type PartialPoll = {
  creator: string;
  pollId: number;
  blockCreated: number;
  multiHash: string;
  startDate: Date;
  endDate: Date;
  url: string;
};
