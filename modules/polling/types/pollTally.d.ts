import BigNumber from 'bignumber.js';
import { PollVoteType } from './pollVoteType';

export type RankedChoiceResult = {
  optionId: string;
  optionName: string;
  firstChoice: BigNumber;
  transfer: BigNumber;
  winner: boolean;
  eliminated: boolean;
  firstPct: BigNumber;
  transferPct: BigNumber;
};

export type PluralityResult = {
  optionId: string;
  optionName: string;
  winner: boolean;
  mkrSupport: BigNumber;
  winner: boolean;
  firstPct: BigNumber; // TODO rename to "percent"?
};

export type PollTallyPluralityOption = {
  firstChoice: BigNumber;
  winner: boolean;
};

export type PollTallyRankedChoiceOption = {
  firstChoice: BigNumber;
  transfer: BigNumber;
  winner: boolean;
  eliminated: boolean;
};

export type PollTallyVote = {
  voter: string;
  optionId: number;
  mkrSupport: number;
  rankedChoiceOption?: number[];
  options: Record<number, PollTallyOption>;
};

export type RawPollTallyRankedChoice = {
  pollVoteType: PollVoteType;
  winner: string | null;
  rounds: number;
  numVoters: number;
  options: Record<number, PollTallyRankedChoiceOption>;
  totalMkrParticipation: number;
  votesByAddress?: PollTallyVote[];
};

export type RawPollTallyPlurality = {
  pollVoteType: PollVoteType;
  winner: string | null;
  numVoters: number;
  options: Record<number, PollTallyPluralityOption>;
  totalMkrParticipation: number;
  votesByAddress?: PollTallyVote[];
};

export type PollTallyRankedChoice = {
  pollVoteType: PollVoteType;
  winner: string | null;
  numVoters: number;
  results: RankedChoiceResult[];
  winningOptionName: string;
  totalMkrParticipation: number;
  votesByAddress?: PollTallyVote[];
  rounds?: number;
};

export type PollTallyPlurality = {
  pollVoteType: PollVoteType;
  winner: string | null;
  numVoters: number;
  results: PluralityResult[];
  winningOptionName: string;
  totalMkrParticipation: number;
  votesByAddress?: PollTallyVote[];
};

export type RawPollTally = RawPollTallyRankedChoice | RawPollTallyPlurality;

export type PollTally = PollTallyRankedChoice | PollTallyPlurality;
