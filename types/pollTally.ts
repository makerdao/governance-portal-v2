import CurrencyObject from './currency';

type Result = {
  optionId: string;
  optionName: string;
  firstChoice: CurrencyObject;
  transfer: CurrencyObject;
  winner: boolean;
  eliminated: boolean;
};

type PollTally = {
  winner: string | null;
  winningOptionName: string;
  rounds: number;
  totalMkrParticipation: CurrencyObject;
  results: Result[];
};

export default PollTally;
