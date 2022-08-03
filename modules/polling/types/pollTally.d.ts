import BigNumber from 'lib/bigNumberJs';
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
  firstPct: number;
  eliminated?: boolean;
  transferPct?: number;
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
  votesByAddress?: PollTallyVote[];
  rounds?: number;
};
