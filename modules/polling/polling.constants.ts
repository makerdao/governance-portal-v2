import { BigNumber } from 'ethers';
import BigNumberJs from 'lib/bigNumberJs';
import { parseUnits } from 'ethers/lib/utils';
import { WAD } from 'modules/web3/constants/numbers';
import { PollVoteType } from './types';
import { TEN_MINUTES_IN_MS } from 'modules/app/constants/time';

export const ABSTAIN = 0;

export const MIN_MKR_REQUIRED_FOR_GASLESS_VOTING = BigNumber.from(parseUnits('0.1'));
export const MIN_MKR_REQUIRED_FOR_GASLESS_VOTING_DISPLAY = new BigNumberJs(
  MIN_MKR_REQUIRED_FOR_GASLESS_VOTING.toString()
)
  .div(WAD.toString())
  .toFormat(1);
export const GASLESS_RATE_LIMIT_IN_MS = TEN_MINUTES_IN_MS;

export const POLL_VOTE_TYPE = {
  PLURALITY_VOTE: 'Plurality Voting' as PollVoteType,
  RANKED_VOTE: 'Ranked Choice IRV' as PollVoteType,
  UNKNOWN: 'Unknown' as PollVoteType
};

export const POLL_VOTE_TYPES_ARRAY: PollVoteType[] = [
  POLL_VOTE_TYPE.PLURALITY_VOTE,
  POLL_VOTE_TYPE.RANKED_VOTE
];

// Poll parameters
export enum PollInputFormat {
  singleChoice = 'single-choice',
  rankFree = 'rank-free',
  chooseFree = 'choose-free'
}

export enum PollVictoryConditions {
  and = 'and',
  majority = 'majority',
  approval = 'approval',
  plurality = 'plurality',
  instantRunoff = 'instant-runoff',
  default = 'default',
  comparison = 'comparison'
}

export enum PollResultDisplay {
  singleVoteBreakdown = 'single-vote-breakdown',
  instantRunoffBreakdown = 'instant-runoff-breakdown',
  approvalBreakdown = 'approval-breakdown'
}
