import { Poll } from './poll';
import { PollTallyVote } from './pollTally';

export type PollVoteHistory = PollTallyVote & {
  poll: Poll;
  optionValue: string[];
};
