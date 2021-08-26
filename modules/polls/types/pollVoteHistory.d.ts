import { PollVote } from './pollVote';

export type PollVoteHistory = PollVote & {
  title: string,
  optionValue: string
}