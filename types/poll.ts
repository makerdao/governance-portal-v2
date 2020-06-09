import VoteTypes from './voteTypes';

type Poll = {
  title: string;
  multiHash: string;
  content: string;
  pollId: number;
  summary: string;
  options: { [optionId: string]: string } | null;
  endDate: string;
  startDate: string;
  discussionLink: string | null;
  voteType: VoteTypes;
};

export default Poll;
