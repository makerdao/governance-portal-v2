import { Poll } from './poll';
import { PollVote } from './pollVote';

export type PollVoteHistory = PollVote & {
  poll: Poll,
  optionValue: string
}