import VoteTypes from './voteTypes';

export type Poll = {
  title: string;
  multiHash: string;
  content: string;
  pollId: number;
  summary: string;
  options: { [optionId: string]: string };
  endDate: Date;
  startDate: Date;
  discussionLink: string | null;
  voteType: VoteTypes;
  categories: string[];
  slug: string;
  ctx: {
    prev: Poll | null;
    next: Poll | null;
  };
  url?: string;
};

export type PartialPoll = {
  pollId: number;
  multiHash: string;
  startDate: Date;
  endDate: Date;
  url: string;
};
