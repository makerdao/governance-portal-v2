import { PollParameters } from './poll';

export type PollTallyVote = {
  voter: string;
  ballot: number[];
  mkrSupport: number;
};

export type PollTallyOption = {
  mkrSupport: number | string;
  optionId: number;
  optionName: string;
  winner: boolean;
  firstPct: number | string;
  eliminated?: boolean;
  transferPct?: number | string;
  transfer?: number | string;
};

export type PollTally = {
  parameters: PollParameters;
  winner: number | null;
  numVoters: number;
  results: PollTallyOption[];
  totalMkrParticipation: number | string;
  totalMkrActiveParticipation: number | string;
  winningOptionName: string;
  victoryConditionMatched: number | null;
  votesByAddress?: PollTallyVote[];
  rounds?: number;
};
