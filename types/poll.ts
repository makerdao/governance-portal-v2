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
  slug: string;
};

export default Poll;
