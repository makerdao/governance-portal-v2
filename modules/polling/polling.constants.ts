import { PollVoteType } from './types';

export const ABSTAIN = 0;

export const POLL_VOTE_TYPE = {
  PLURALITY_VOTE: 'Plurality Voting' as PollVoteType,
  RANKED_VOTE: 'Ranked Choice IRV' as PollVoteType,
  UNKNOWN: 'Unknown' as PollVoteType
};

export const POLL_VOTE_TYPES_ARRAY: PollVoteType[] = [
  POLL_VOTE_TYPE.PLURALITY_VOTE,
  POLL_VOTE_TYPE.RANKED_VOTE
];
