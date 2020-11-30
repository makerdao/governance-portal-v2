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

type PollTally = {
  winner: string | null;
  winningOptionName: string;
  rounds: number;
  totalMkrParticipation: CurrencyObject;
  results: Result[];
  numVoters: number;
};

export default PollTally;
