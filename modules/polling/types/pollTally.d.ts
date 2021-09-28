import CurrencyObject from './currency';
import BigNumber from 'bignumber.js';

type Result = {
  optionId: string;
  optionName: string;
  firstChoice: BigNumber;
  transfer: BigNumber;
  winner: boolean;
  eliminated: boolean;
  firstPct: BigNumber;
  transferPct: BigNumber;
};

export type PollTallyOption = {
  firstChoice: BigNumber;
  transfer: BigNumber;
  winner: boolean;
  eliminated: boolean;
};

export type RawPollTally = {
  winner: string | null;
  rounds: number;
  totalMkrParticipation: CurrencyObject;
  numVoters: number;
  options: Record<number, PollTallyOption>;
};

export type PollTallyVote = {
  voter: string;
  optionId: number;
  mkrSupport: number;
  rankedChoiceOption?: number[];
  options: Record<number, PollTallyOption>;
};

export type PollTally = RawPollTally & {
  results: Result[];
  winningOptionName: string;
  totalMkrParticipation: CurrencyObject;
  votesByAddress?: PollTallyVote[];
};
