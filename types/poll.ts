import VoteTypes from './voteTypes';

type Poll = {
  title: string;
  multiHash: string;
  content: string;
  pollId: number;
  summary: string;
  options: { [optionId: string]: string };
  endDate: string;
  startDate: string;
  discussionLink: string | null;
  voteType: VoteTypes;
  categories: string[];
  slug: string;
  ctx?: {
    prev: Poll | null;
    next: Poll | null;
  };
};

export default Poll;

export type PartialPoll = {
  pollId: number;
  multiHash: string;
  startDate: number;
  endDate: number;
  url: string;
};
