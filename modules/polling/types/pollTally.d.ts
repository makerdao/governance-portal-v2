import CurrencyObject from './currency';
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
  winner;
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
  rounds?: number;
  totalMkrParticipation: CurrencyObject;
  numVoters: number;
  options: Record<number, PollTallyRankedChoiceOption>;
  results: RankedChoiceResult[];
  winningOptionName: string;
  totalMkrParticipation: CurrencyObject;
  votesByAddress?: PollTallyVote[];
};

export type RawPollTallyPlurality = {
  pollVoteType: PollVoteType;
  winner: string | null;
  totalMkrParticipation: CurrencyObject;
  numVoters: number;
  options: Record<number, PollTallyPluralityOption>;
  results: PluralityResult[];
  winningOptionName: string;
  totalMkrParticipation: CurrencyObject;
  votesByAddress?: PollTallyVote[];
};

export type RawPollTally = RawPollTallyRankedChoice | RawPollTallyPlurality;


export type PollTally = PollTallyRankedChoice | PollTallyPlurality;
