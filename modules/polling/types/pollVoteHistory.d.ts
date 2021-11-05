import { Poll } from './poll';
import { RawPollTally } from './pollTally';
import { PollVote } from './pollVote';

export type PollVoteHistory = PollVote & {
  poll: Poll;
  tally: RawPollTally;
  optionValue: string;
};
